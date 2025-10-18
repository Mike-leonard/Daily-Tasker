import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';

import { initialTasks } from '../constants/initialTasks';
import { offDaySchedule } from '../constants/offDaySchedule';
import { workDaySchedule } from '../constants/workDaySchedule';
import { useCalendarState } from '../hooks/useCalendarState';
import { useTaskTimers } from '../hooks/useTaskTimers';
import { useNotificationSettings } from '../context/NotificationContext';
import { calendarStyles } from '../styles/styles';
import { formatLongDate } from '../utils/date';
import { buildScheduleId, buildScheduleTimerId } from '../utils/schedule';
import CalendarHeader from './CalendarHeader';
import DayPage from './DayPage';
import NotificationSettings from './NotificationSettings';

const CalendarPager = () => {
  const { width } = useWindowDimensions();
  const {
    dates,
    currentIndex,
    setCurrentIndex,
    appendNextDate,
    handleInputChange,
    handleAddTaskForDate,
    toggleTaskCompletion,
    removeTask,
    completeTask,
    isScheduleCompleted,
    markScheduleCompleted,
    resetScheduleCompletion,
    getTasksForDate,
    getInputValueForDate,
    getDayTypeForDate,
    setDayTypeForDate,
    currentDateEntry,
    remainingTasks,
  } = useCalendarState(initialTasks);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const { sendNotification } = useNotificationSettings();

  const getDateLabel = useCallback(
    (dateKey) => {
      const entry = dates.find((item) => item.key === dateKey);
      return entry ? formatLongDate(entry.date) : undefined;
    },
    [dates],
  );

  const handleTimerComplete = useCallback(
    (timerId, meta) => {
      const { kind, dateKey, scheduleId, title, time } = meta ?? {};
      const dateLabel = dateKey ? getDateLabel(dateKey) : undefined;

      if (kind === 'task' && dateKey) {
        completeTask(dateKey, timerId);
        sendNotification({
          title: 'Task complete',
          body: `${title ?? 'Task'} finished${
            dateLabel ? ` • ${dateLabel}` : ''
          }.`,
        });
        return;
      }

      if (kind === 'schedule' && dateKey && scheduleId) {
        markScheduleCompleted(dateKey, scheduleId);
        sendNotification({
          title: 'Schedule block done',
          body: `${title ?? 'Block'}${time ? ` (${time})` : ''} completed${
            dateLabel ? ` • ${dateLabel}` : ''
          }.`,
        });
      }
    },
    [completeTask, markScheduleCompleted, getDateLabel, sendNotification],
  );

  const { startTimer, clearTimer, timerForTask } =
    useTaskTimers(handleTimerComplete);

  const handleStartTaskTimer = useCallback(
    (dateKey, task, durationMinutes) =>
      startTimer(task.id, durationMinutes, {
        kind: 'task',
        dateKey,
        taskId: task.id,
        title: task.title,
      }),
    [startTimer],
  );

  const handleStartScheduleTimer = useCallback(
    (dateKey, scheduleId, timerId, durationMinutes, scheduleItem) => {
      const started = startTimer(timerId, durationMinutes, {
        kind: 'schedule',
        dateKey,
        scheduleId,
        title: scheduleItem?.activity,
        time: scheduleItem?.time,
      });
      if (started) {
        resetScheduleCompletion(dateKey, scheduleId);
      }
      return started;
    },
    [resetScheduleCompletion, startTimer],
  );

  const handleRemoveTask = useCallback(
    (dateKey, taskId) => {
      removeTask(dateKey, taskId);
      clearTimer(taskId);
    },
    [removeTask, clearTimer],
  );

  const handleToggleTask = useCallback(
    (dateKey, taskId) => {
      toggleTaskCompletion(dateKey, taskId);
      clearTimer(taskId);
    },
    [toggleTaskCompletion, clearTimer],
  );

  const clearScheduleTimersForDate = useCallback(
    (dateKey) => {
      const scheduleConfig = {
        work: workDaySchedule,
        off: offDaySchedule,
      };

      Object.entries(scheduleConfig).forEach(([type, scheduleList]) => {
        scheduleList.forEach((item) => {
          const scheduleId = buildScheduleId(type, item.time);
          const timerId = buildScheduleTimerId(dateKey, scheduleId);
          clearTimer(timerId);
        });
      });
    },
    [clearTimer],
  );

  const handleDayTypeChange = useCallback(
    (dateKey, nextType) => {
      const currentType = getDayTypeForDate(dateKey);
      if (currentType === nextType) {
        return;
      }

      clearScheduleTimersForDate(dateKey);
      setDayTypeForDate(dateKey, nextType);
    },
    [getDayTypeForDate, clearScheduleTimersForDate, setDayTypeForDate],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      const nextIndex = viewableItems[0].index ?? 0;
      setCurrentIndex(nextIndex);
    }
  });

  const headerSubtitle = currentDateEntry
    ? `${formatLongDate(currentDateEntry.date)} • ${
        remainingTasks === 0
          ? 'All tasks completed'
          : `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} remaining`
      }`
    : 'Preparing your schedule...';

  return (
    <KeyboardAvoidingView
      style={calendarStyles.keyboardAvoider}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CalendarHeader
        title="Tasker"
        subtitle={headerSubtitle}
        onPressSettings={() => setSettingsVisible(true)}
      />
      <FlatList
        data={dates}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <DayPage
            width={width}
            dateEntry={item}
            tasks={getTasksForDate(item.key)}
            inputValue={getInputValueForDate(item.key)}
            dayType={getDayTypeForDate(item.key)}
            onInputChange={(value) => handleInputChange(item.key, value)}
            onAddTask={() => handleAddTaskForDate(item.key)}
            onToggleTask={(taskId) => handleToggleTask(item.key, taskId)}
            onRemoveTask={(taskId) => handleRemoveTask(item.key, taskId)}
            onChangeDayType={(type) => handleDayTypeChange(item.key, type)}
            onStartTaskTimer={(task, duration) =>
              handleStartTaskTimer(item.key, task, duration)
            }
            onStartScheduleTimer={(scheduleId, timerId, duration, scheduleItem) =>
              handleStartScheduleTimer(
                item.key,
                scheduleId,
                timerId,
                duration,
                scheduleItem,
              )
            }
            getTimer={timerForTask}
            isScheduleCompleted={(scheduleId) =>
              isScheduleCompleted(item.key, scheduleId)
            }
          />
        )}
        horizontal
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onEndReached={appendNextDate}
        onEndReachedThreshold={0.6}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      <NotificationSettings
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default CalendarPager;
