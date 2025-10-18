import { SafeAreaView, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import CalendarPager from './src/components/CalendarPager';
import { NotificationProvider } from './src/context/NotificationContext';
import { appStyles } from './src/styles/styles';

export default function App() {
  return (
    <SafeAreaView style={appStyles.container}>
      <StatusBar barStyle="dark-content" />
      <ExpoStatusBar style="dark" />
      <NotificationProvider>
        <CalendarPager />
      </NotificationProvider>
    </SafeAreaView>
  );
}
