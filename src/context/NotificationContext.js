import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationContext = createContext({
  enabled: false,
  permissionStatus: 'undetermined',
  toggleNotifications: async () => false,
  sendNotification: async () => undefined,
});

const isGranted = (status) =>
  status === 'granted' || status === 'provisional';

export const NotificationProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');

  useEffect(() => {
    Notifications.getPermissionsAsync()
      .then(({ status }) => {
        setPermissionStatus(status);
      })
      .catch(() => {
        setPermissionStatus('undetermined');
      });
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
      }).catch(() => {});
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      if (!isGranted(status)) {
        Alert.alert(
          'Notifications disabled',
          'We could not enable notifications because permission was denied.',
        );
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert(
        'Notifications unavailable',
        'We were unable to request notification permissions.',
      );
      return false;
    }
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (!enabled) {
      const granted = isGranted(permissionStatus)
        ? true
        : await requestPermission();
      if (!granted) {
        return false;
      }
      setEnabled(true);
      return true;
    }

    setEnabled(false);
    return true;
  }, [enabled, permissionStatus, requestPermission]);

  const sendNotification = useCallback(
    async ({ title, body }) => {
      if (!enabled) {
        return;
      }

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: 'default',
            channelId: 'default',
            data: { source: 'tasker' },
          },
          trigger: null,
        });
      } catch (error) {
        // fail silently
      }
    },
    [enabled],
  );

  const value = useMemo(
    () => ({
      enabled,
      permissionStatus,
      toggleNotifications,
      sendNotification,
    }),
    [enabled, permissionStatus, toggleNotifications, sendNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationSettings = () => useContext(NotificationContext);
