import { SafeAreaView, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import CalendarPager from './src/components/CalendarPager';
import { NotificationProvider } from './src/context/NotificationContext';
import { ScheduleProvider } from './src/context/ScheduleContext';
import { appStyles } from './src/styles/styles';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ExpoStatusBar style="dark" />
      <NotificationProvider>
        <ScheduleProvider>
          <CalendarPager />
        </ScheduleProvider>
      </NotificationProvider>
    </>
  );
}
