import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TouchableOpacity, View } from 'react-native';

import { calendarStyles } from '../styles/styles';

const CalendarHeader = ({ title, subtitle, onPressSettings }) => (
  <View style={calendarStyles.headerSection}>
    <View style={calendarStyles.headerRow}>
      <View style={calendarStyles.headerTitles}>
        <Text style={calendarStyles.heading}>{title}</Text>
        <Text style={calendarStyles.subheading}>{subtitle}</Text>
      </View>
      <TouchableOpacity
        onPress={onPressSettings}
        style={calendarStyles.headerButton}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Ionicons name="settings-outline" size={20} color="#0f172a" />
      </TouchableOpacity>
    </View>
  </View>
);

export default CalendarHeader;
