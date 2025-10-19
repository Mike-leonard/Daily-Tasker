import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StyleSheet,
  View,
} from 'react-native';

import { initialTasks } from '../constants/initialTasks';
import { useCalendarState } from '../hooks/useCalendarState';
import { useTaskTimers } from '../hooks/useTaskTimers';
import { useNotificationSettings } from '../context/NotificationContext';
import { useSchedules } from '../context/ScheduleContext';
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
    completeTask,
    isScheduleCompleted,
    markScheduleCompleted,
    resetScheduleCompletion,
    resetScheduleCompletionForDate,
    prependPreviousDate,
    removeDate,
    getDayTypeForDate,
    setDayTypeForDate,
    currentDateEntry,
  } = useCalendarState(initialTasks);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const { sendNotification } = useNotificationSettings();
  const { schedules } = useSchedules();

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
          body: `${title ?? 'Task'} finished${dateLabel ? ` • ${dateLabel}` : ''
            }.`,
        });
        return;
      }

      if (kind === 'schedule' && dateKey && scheduleId) {
        markScheduleCompleted(dateKey, scheduleId);
        sendNotification({
          title: 'Schedule block done',
          body: `${title ?? 'Block'}${time ? ` (${time})` : ''} completed${dateLabel ? ` • ${dateLabel}` : ''
            }.`,
        });
      }
    },
    [completeTask, markScheduleCompleted, getDateLabel, sendNotification],
  );

  const { startTimer, clearTimer, timerForTask } =
    useTaskTimers(handleTimerComplete);

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

  const clearScheduleTimersForDate = useCallback(
    (dateKey) => {
      Object.entries(schedules).forEach(([type, scheduleList]) => {
        scheduleList.forEach((item) => {
          const scheduleId = buildScheduleId(type, item.time);
          const timerId = buildScheduleTimerId(dateKey, scheduleId);
          clearTimer(timerId);
        });
      });
    },
    [clearTimer, schedules],
  );

  const resetSchedulesForDayType = useCallback(
    (dayType) => {
      dates.forEach((entry) => {
        const currentType = getDayTypeForDate(entry.key);
        if (currentType === dayType) {
          clearScheduleTimersForDate(entry.key);
          resetScheduleCompletionForDate(entry.key);
        }
      });
    },
    [dates, getDayTypeForDate, clearScheduleTimersForDate, resetScheduleCompletionForDate],
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

  const currentDateKey = currentDateEntry?.key;
  const activeDayType = currentDateKey
    ? getDayTypeForDate(currentDateKey)
    : 'work';
  const activeSchedule = currentDateKey
    ? schedules[activeDayType] ?? []
    : [];
  const totalBlocks = activeSchedule.length;
  const completedBlocks = currentDateKey
    ? activeSchedule.filter((block) =>
        isScheduleCompleted(
          currentDateKey,
          buildScheduleId(activeDayType, block.time),
        ),
      ).length
    : 0;
  const remainingBlocks = Math.max(totalBlocks - completedBlocks, 0);

  const headerSubtitle = currentDateEntry
    ? `${formatLongDate(currentDateEntry.date)} • ${
        totalBlocks === 0
          ? 'No blocks scheduled'
          : `${remainingBlocks} of ${totalBlocks} blocks remaining`
      }`
    : 'Preparing your schedule...';

  const handleAddPreviousDay = useCallback(() => {
    prependPreviousDate();
  }, [prependPreviousDate]);

  const handleRemoveCurrentDay = useCallback(() => {
    if (!currentDateEntry) {
      return;
    }
    clearScheduleTimersForDate(currentDateEntry.key);
    removeDate(currentDateEntry.key);
  }, [clearScheduleTimersForDate, currentDateEntry, removeDate]);

  return (
    <View style={calendarStyles.container}>
      <KeyboardAvoidingView
        style={calendarStyles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <CalendarHeader
          title="Tasker"
          subtitle={headerSubtitle}
          onPressSettings={() => setSettingsVisible(true)}
          onAddPreviousDay={handleAddPreviousDay}
          onRemoveCurrentDay={handleRemoveCurrentDay}
          canRemoveCurrentDay={dates.length > 1}
        />
        <FlatList
          data={dates}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <DayPage
              width={width}
              dateEntry={item}
              dayType={getDayTypeForDate(item.key)}
              schedule={schedules[getDayTypeForDate(item.key)] ?? []}
              onChangeDayType={(type) => handleDayTypeChange(item.key, type)}
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
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          pagingEnabled
          snapToAlignment="start"
          decelerationRate="fast"
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
          onSchedulesUpdated={resetSchedulesForDayType}
        />
        </KeyboardAvoidingView>
    </View>


  );
};

export default CalendarPager;
