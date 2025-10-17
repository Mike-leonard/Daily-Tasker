import { Text, View } from 'react-native';

import { calendarStyles } from '../styles/styles';

const CalendarHeader = ({ title, subtitle }) => (
  <View style={calendarStyles.headerSection}>
    <Text style={calendarStyles.heading}>{title}</Text>
    <Text style={calendarStyles.subheading}>{subtitle}</Text>
  </View>
);

export default CalendarHeader;
