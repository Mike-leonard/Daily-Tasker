import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { useScheduleAnalytics } from '../hooks/useScheduleAnalytics';
import { calendarStyles } from '../styles/styles';

const StatRow = ({ label, value, subtitle }) => (
  <View style={calendarStyles.analyticsRow}>
    <View>
      <Text style={calendarStyles.analyticsRowLabel}>{label}</Text>
      {subtitle ? (
        <Text style={calendarStyles.analyticsRowSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
    <Text style={calendarStyles.analyticsRowValue}>{value}</Text>
  </View>
);

export const DashboardModal = ({ visible, onRequestClose }) => {
  const { analytics, status, hasData } = useScheduleAnalytics();

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onRequestClose}>
      <View style={calendarStyles.modalContainer}>
        <View style={calendarStyles.modalHeader}>
          <Text style={calendarStyles.modalTitle}>Progress Dashboard</Text>
          <Pressable
            onPress={onRequestClose}
            style={({ pressed }) => [
              calendarStyles.headerButton,
              pressed && calendarStyles.pressablePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close dashboard"
          >
            <Ionicons name="close" size={22} color="#0f172a" />
          </Pressable>
        </View>

        {status === 'error' ? (
          <View style={calendarStyles.analyticsEmptyState}>
            <Text style={calendarStyles.settingWarning}>
              Unable to load progress data right now. Please try again soon.
            </Text>
          </View>
        ) : null}

        {status !== 'error' ? (
          <ScrollView
            style={calendarStyles.analyticsScroll}
            contentContainerStyle={calendarStyles.analyticsContent}
            showsVerticalScrollIndicator={false}
          >
            {status === 'loading' ? (
              <Text style={calendarStyles.analyticsLoadingText}>
                Calculating your progress…
              </Text>
            ) : null}

            {status === 'ready' && !hasData ? (
              <View style={calendarStyles.analyticsEmptyState}>
                <Ionicons name="analytics-outline" size={48} color="#94a3b8" />
                <Text style={calendarStyles.settingSubtitle}>
                  Complete schedule blocks to start building your dashboard.
                </Text>
              </View>
            ) : null}

            {status === 'ready' &&
              analytics.months.map((month) => (
                <View key={month.key} style={calendarStyles.analyticsCard}>
                  <Text style={calendarStyles.analyticsMonthLabel}>
                    {month.label}
                  </Text>
                  <StatRow
                    label="Total focus hours"
                    value={`${month.totalHours.toFixed(1)} h`}
                  />
                  <View style={calendarStyles.analyticsDivider} />
                  {month.tasks.map((task) => (
                    <StatRow
                      key={`${task.dayType}-${task.activity}`}
                      label={task.activity}
                      subtitle={`${task.dayType === 'work' ? 'Work day' : 'Off day'} • ${
                        task.occurrences
                      } ${task.occurrences === 1 ? 'session' : 'sessions'}`}
                      value={`${task.hours.toFixed(1)} h`}
                    />
                  ))}
                </View>
              ))}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
};

export default DashboardModal;
