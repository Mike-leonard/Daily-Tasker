import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';

import { initialTasks } from '../constants/initialTasks';
import { useCalendarState } from '../hooks/useCalendarState';
import { useTaskTimers } from '../hooks/useTaskTimers';
import { useNotificationSettings } from '../context/NotificationContext';
import { useSchedules } from '../context/ScheduleContext';
import { calendarStyles } from '../styles/styles';
import { addDays, dateKeyFromDate, formatLongDate } from '../utils/date';
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
    replaceScheduleCompletionForDate,
    prependPreviousDate,
    removeDate,
    getDayTypeForDate,
    setDayTypeForDate,
    currentDateEntry,
  } = useCalendarState(initialTasks);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const { sendNotification } = useNotificationSettings();
  const {
    schedules,
    recordScheduleCompletion,
    clearScheduleCompletion,
    clearScheduleCompletionForDate,
    observeScheduleCompletions,
  } = useSchedules();

  const getDateLabel = useCallback(
    (dateKey) => {
      const entry = dates.find((item) => item.key === dateKey);
      return entry ? formatLongDate(entry.date) : undefined;
    },
    [dates],
  );

  const handleTimerComplete = useCallback(
    (timerId, meta) => {
      const {
        kind,
        dateKey,
        scheduleId,
        title,
        time,
        dayType,
        scheduleIndex,
        dateValue,
      } = meta ?? {};
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

      if (
        kind === 'schedule' &&
        dateKey &&
        scheduleId &&
        dayType &&
        Number.isInteger(scheduleIndex)
      ) {
        markScheduleCompleted(dateKey, scheduleId);
        recordScheduleCompletion(
          dateKey,
          dayType,
          scheduleIndex,
          meta?.scheduleItem,
          dateValue,
        );
        sendNotification({
          title: 'Schedule block done',
          body: `${title ?? 'Block'}${time ? ` (${time})` : ''} completed${
            dateLabel ? ` • ${dateLabel}` : ''
          }.`,
        });
      }
    },
    [
      completeTask,
      markScheduleCompleted,
      recordScheduleCompletion,
      getDateLabel,
      sendNotification,
    ],
  );

  const { startTimer, clearTimer, timerForTask } =
    useTaskTimers(handleTimerComplete);

  const handleStartScheduleTimer = useCallback(
    ({
      dateKey,
      dayType,
      scheduleId,
      scheduleIndex,
      timerId,
      durationMinutes,
      scheduleItem,
      dateValue,
    }) => {
      const started = startTimer(timerId, durationMinutes, {
        kind: 'schedule',
        dateKey,
        dayType,
        scheduleId,
        scheduleIndex,
        title: scheduleItem?.activity,
        time: scheduleItem?.time,
        scheduleItem,
        dateValue,
      });
      if (started) {
        resetScheduleCompletion(dateKey, scheduleId);
        clearScheduleCompletion(dateKey, dayType, scheduleIndex, dateValue);
      }
      return started;
    },
    [clearScheduleCompletion, resetScheduleCompletion, startTimer],
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
          clearScheduleCompletionForDate(entry.key, entry.date, dayType);
        }
      });
    },
    [
      dates,
      getDayTypeForDate,
      clearScheduleTimersForDate,
      resetScheduleCompletionForDate,
      clearScheduleCompletionForDate,
    ],
  );

  const handleDayTypeChange = useCallback(
    (dateKey, nextType) => {
      const currentType = getDayTypeForDate(dateKey);
      if (currentType === nextType) {
        return;
      }

      const currentSchedule = schedules[currentType] ?? [];
      const hasCompletedBlock = currentSchedule.some((item) =>
        isScheduleCompleted(
          dateKey,
          buildScheduleId(currentType, item.time),
        ),
      );

      if (hasCompletedBlock) {
        Alert.alert(
          'Cannot switch plan',
          'This day already has completed blocks. Clear the completions before changing the day type.',
        );
        return;
      }

      const entry = dates.find((item) => item.key === dateKey);
      const dateValue = entry?.date;

      clearScheduleTimersForDate(dateKey);
      clearScheduleCompletionForDate(dateKey, dateValue, currentType);
      setDayTypeForDate(dateKey, nextType);
    },
    [
      dates,
      schedules,
      getDayTypeForDate,
      clearScheduleTimersForDate,
      clearScheduleCompletionForDate,
      isScheduleCompleted,
      setDayTypeForDate,
    ],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      const nextIndex = viewableItems[0].index ?? 0;
      setCurrentIndex(nextIndex);
    }
  });

  const todayKey = useMemo(() => dateKeyFromDate(new Date()), []);
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
    clearScheduleCompletionForDate(
      currentDateEntry.key,
      currentDateEntry.date,
    );
    removeDate(currentDateEntry.key);
  }, [
    clearScheduleCompletionForDate,
    clearScheduleTimersForDate,
    currentDateEntry,
    removeDate,
  ]);

  useEffect(() => {
    const unsubscribers = dates.map((entry) =>
      observeScheduleCompletions(entry.key, entry.date, (snapshot) => {
        const raw = snapshot ?? {};
        const completionMap = {};

        Object.entries(raw).forEach(([dayType, dayEntries]) => {
          const template = schedules[dayType] ?? [];
          Object.entries(dayEntries ?? {}).forEach(([indexKey, value]) => {
            if (!value || value.status !== true) {
              return;
            }
            const index = Number(indexKey);
            if (!Number.isInteger(index) || index < 0) {
              return;
            }
            const scheduleItem = template[index];
            if (!scheduleItem) {
              return;
            }
            const scheduleId = buildScheduleId(dayType, scheduleItem.time);
            if (scheduleId) {
              completionMap[scheduleId] = true;
            }
          });
        });

        replaceScheduleCompletionForDate(entry.key, completionMap);
      }),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [
    dates,
    observeScheduleCompletions,
    replaceScheduleCompletionForDate,
    schedules,
  ]);

  useEffect(() => {
    if (dates.length === 0) {
      return;
    }

    let isCancelled = false;

    const fetchSnapshotOnce = (key, dateValue) =>
      new Promise((resolve) => {
        let unsubscribe = () => {};
        unsubscribe = observeScheduleCompletions(key, dateValue, (snapshot) => {
          unsubscribe();
          resolve(snapshot ?? null);
        });
      });

    const scanHistory = async () => {
      let cursorDate = addDays(dates[0].date, -1);

      for (let steps = 0; steps < 60 && !isCancelled; steps += 1) {
        const cursorKey = dateKeyFromDate(cursorDate);

        if (dates.some((entry) => entry.key === cursorKey)) {
          cursorDate = addDays(cursorDate, -1);
          continue;
        }

        const snapshot = await fetchSnapshotOnce(cursorKey, cursorDate);
        if (isCancelled) {
          return;
        }

        if (!snapshot) {
          cursorDate = addDays(cursorDate, -1);
          continue;
        }

        const hasHistoricalCompletion = Object.values(snapshot).some(
          (dayEntries) =>
            Object.values(dayEntries ?? {}).some((entry) => entry?.status === true),
        );

        if (hasHistoricalCompletion) {
          prependPreviousDate();
          return;
        }

        cursorDate = addDays(cursorDate, -1);
      }
    };

    scanHistory();

    return () => {
      isCancelled = true;
    };
  }, [dates, observeScheduleCompletions, prependPreviousDate]);

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
          renderItem={({ item }) => {
            const dayType = getDayTypeForDate(item.key);
            return (
              <DayPage
                width={width}
                dateEntry={item}
                dayType={dayType}
                schedule={schedules[dayType] ?? []}
                isActiveDay={item.key === todayKey}
                onChangeDayType={(type) => handleDayTypeChange(item.key, type)}
                onStartScheduleTimer={({
                  scheduleId,
                  scheduleIndex,
                  timerId,
                  durationMinutes,
                  scheduleItem,
                }) =>
                  handleStartScheduleTimer({
                    dateKey: item.key,
                    dayType,
                    scheduleId,
                    scheduleIndex,
                    timerId,
                    durationMinutes,
                    scheduleItem,
                    dateValue: item.date,
                  })
                }
                getTimer={timerForTask}
                isScheduleCompleted={(scheduleId) =>
                  isScheduleCompleted(item.key, scheduleId)
                }
              />
            );
          }}
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
