import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { calendarStyles } from '../styles/styles';

const CalendarHeader = ({
  title,
  subtitle,
  onPressDashboard,
  onPressSettings,
  onAddPreviousDay,
  onRemoveCurrentDay,
  canRemoveCurrentDay = true,
}) => (
  <View style={calendarStyles.headerSection}>
    <View style={calendarStyles.headerRow}>
      <View style={calendarStyles.headerTitles}>
        <Text style={calendarStyles.heading}>{title}</Text>
        <Text style={calendarStyles.subheading}>{subtitle}</Text>
      </View>
      <View style={calendarStyles.headerActions}>
        {onAddPreviousDay ? (
          <Pressable
            onPress={onAddPreviousDay}
            style={({ pressed }) => [
              calendarStyles.headerButton,
              pressed && calendarStyles.pressablePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add previous day"
            hitSlop={8}
          >
            <Ionicons name="arrow-back-circle-outline" size={20} color="#0f172a" />
          </Pressable>
        ) : null}
        {onRemoveCurrentDay ? (
          <Pressable
            onPress={onRemoveCurrentDay}
            disabled={!canRemoveCurrentDay}
            style={({ pressed }) => [
              calendarStyles.headerButton,
              !canRemoveCurrentDay && calendarStyles.headerButtonDisabled,
              pressed && calendarStyles.pressablePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Remove current day"
            accessibilityState={{ disabled: !canRemoveCurrentDay }}
            hitSlop={8}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={canRemoveCurrentDay ? '#0f172a' : '#94a3b8'}
            />
          </Pressable>
        ) : null}
        {onPressDashboard ? (
          <Pressable
            onPress={onPressDashboard}
            style={({ pressed }) => [
              calendarStyles.headerButton,
              pressed && calendarStyles.pressablePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open progress dashboard"
            hitSlop={8}
          >
            <Ionicons name="stats-chart-outline" size={20} color="\#0f172a" />
          </Pressable>
        ) : null}
        <Pressable
          onPress={onPressSettings}
          style={({ pressed }) => [
            calendarStyles.headerButton,
            pressed && calendarStyles.pressablePressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={20} color="#0f172a" />
        </Pressable>
      </View>
    </View>
  </View>
);

export default CalendarHeader;
