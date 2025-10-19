import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useWindowDimensions } from 'react-native';

import { dayStyles } from '../styles/styles';
import { formatBadgeLabel, formatLongDate, formatWeekday } from '../utils/date';
import {
  buildScheduleId,
  buildScheduleTimerId,
  extractDurationMinutes,
} from '../utils/schedule';
import { formatDuration, formatMinutesToLabel } from '../utils/time';

const DAY_TYPE_OPTIONS = [
  { value: 'work', label: 'Work Day' },
  { value: 'off', label: 'Off Day' },
];

const showTimerBusyAlert = () =>
  Alert.alert(
    'Timer already running',
    'Please wait for the current timer to finish before starting another.',
  );

const DayPage = ({
  dateEntry,
  dayType,
  schedule = [],
  onChangeDayType,
  onStartScheduleTimer = () => true,
  getTimer = () => undefined,
  isScheduleCompleted = () => false,
  width,
}) => {
  const showSchedule = schedule.length > 0;

  const promptForDuration = (onSelect) =>
    Alert.alert('Start focus timer', 'Choose a duration', [
      {
        text: '30 minutes',
        onPress: () => {
          const success = onSelect(30);
          if (!success) {
            showTimerBusyAlert();
          }
        },
      },
      {
        text: '1 hour',
        onPress: () => {
          const success = onSelect(60);
          if (!success) {
            showTimerBusyAlert();
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);

  const handleScheduleTimerStart = (
    scheduleId,
    timerId,
    durationMinutes,
    completed,
    scheduleItem,
  ) => {
    if (completed) {
      Alert.alert(
        'Already completed',
        'This schedule block is already marked as done.',
      );
      return;
    }

    const existingTimer = getTimer(timerId);
    if (existingTimer?.isRunning) {
      Alert.alert(
        'Timer already running',
        'A focus timer is currently active for this schedule block.',
      );
      return;
    }

    if (Number.isFinite(durationMinutes) && durationMinutes > 0) {
      const success = onStartScheduleTimer(
        scheduleId,
        timerId,
        durationMinutes,
        scheduleItem,
      );
      if (!success) {
        showTimerBusyAlert();
      }
      return;
    }

    promptForDuration((duration) => {
      const success = onStartScheduleTimer(
        scheduleId,
        timerId,
        duration,
        scheduleItem,
      );
      if (!success) {
        showTimerBusyAlert();
      }
      return success;
    });
  };

  const { height: windowHeight } = useWindowDimensions();

  return (
    <View style={[dayStyles.page, { width, height: windowHeight }]}>
      <ScrollView
        style={dayStyles.scrollContainer}
        contentContainerStyle={[
          dayStyles.contentContainer,
          { minHeight: windowHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View style={dayStyles.header}>
          <View style={dayStyles.dateBadge}>
            <Text style={dayStyles.dateBadgeText}>
              {formatBadgeLabel(dateEntry.date)}
            </Text>
          </View>
          <Text style={dayStyles.title}>{formatWeekday(dateEntry.date)}</Text>
        </View>

        <View style={dayStyles.dayTypeRow}>
          {DAY_TYPE_OPTIONS.map((option) => {
            const selected = dayType === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  dayStyles.dayTypeOption,
                  selected && dayStyles.dayTypeOptionSelected,
                ]}
                onPress={() => onChangeDayType(option.value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`Mark this as ${option.label}`}
              >
                <Ionicons
                  name={selected ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={selected ? '#2563eb' : '#6b7280'}
                />
                <Text
                  style={[
                    dayStyles.dayTypeLabel,
                    selected && dayStyles.dayTypeLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showSchedule && (
          <View style={dayStyles.scheduleSection}>
            <Text style={dayStyles.scheduleHeading}>
              {dayType === 'work' ? 'Work Day Plan' : 'Off Day Plan'}
            </Text>
            {schedule.map((item) => {
              const scheduleId = buildScheduleId(dayType, item.time);
              const timerId = buildScheduleTimerId(dateEntry.key, scheduleId);
              const timer = getTimer(timerId);
              const timerRunning = Boolean(timer?.isRunning);
              const timerLabel = timerRunning
                ? formatDuration(timer.remainingMs)
                : null;
              const completed = isScheduleCompleted(scheduleId);
              const durationMinutes = extractDurationMinutes(item.time);
              const durationLabel = formatMinutesToLabel(durationMinutes);
              const buttonLabel = completed
                ? 'Done'
                : timerRunning
                ? timerLabel ?? 'Running'
                : durationLabel
                ? `Start ${durationLabel}`
                : 'Start';

              return (
                <View
                  key={`${item.time}-${item.activity}`}
                  style={[
                    dayStyles.scheduleRow,
                    completed && dayStyles.scheduleRowCompleted,
                  ]}
                >
                  <View style={dayStyles.scheduleInfo}>
                    <Text style={dayStyles.scheduleTime}>{item.time}</Text>
                    <Text style={dayStyles.scheduleActivity}>
                      {item.activity}
                    </Text>
                    {timerRunning && (
                      <Text style={dayStyles.scheduleTimerText}>
                        Focus timer: {timerLabel}
                      </Text>
                    )}
                  </View>
                  <View style={dayStyles.scheduleActions}>
                    <TouchableOpacity
                      onPress={() =>
                        handleScheduleTimerStart(
                          scheduleId,
                          timerId,
                          durationMinutes,
                          completed,
                          item,
                        )
                      }
                      disabled={completed}
                      style={[
                        dayStyles.scheduleButton,
                        timerRunning && dayStyles.scheduleButtonRunning,
                        completed && dayStyles.scheduleButtonCompleted,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Start focus timer for ${item.activity}`}
                    >
                      <Text
                        style={[
                          dayStyles.scheduleButtonText,
                          completed && dayStyles.scheduleButtonTextCompleted,
                        ]}
                      >
                        {buttonLabel}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
};

export default DayPage;
