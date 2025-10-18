import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Modal,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';

import { calendarStyles } from '../styles/styles';
import { useNotificationSettings } from '../context/NotificationContext';

const NotificationSettings = ({ visible, onRequestClose }) => {
  const { enabled, toggleNotifications, permissionStatus } =
    useNotificationSettings();

  const handleToggle = async () => {
    const success = await toggleNotifications();
    if (!success && !enabled) {
      onRequestClose?.();
    }
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={calendarStyles.modalBackdrop}>
        <View style={calendarStyles.modalCard}>
          <View style={calendarStyles.modalHeader}>
            <Text style={calendarStyles.modalTitle}>Notification Settings</Text>
            <Pressable
              onPress={onRequestClose}
              accessibilityRole="button"
              accessibilityLabel="Close settings"
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color="#0f172a" />
            </Pressable>
          </View>

          <View style={calendarStyles.settingRow}>
            <View style={calendarStyles.settingCopy}>
              <Text style={calendarStyles.settingTitle}>Timer alerts</Text>
              <Text style={calendarStyles.settingSubtitle}>
                Push a notification when a focus timer completes.
              </Text>
              {permissionStatus === 'denied' && (
                <Text style={calendarStyles.settingWarning}>
                  Notifications are disabled in system settings.
                </Text>
              )}
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              thumbColor={enabled ? '#2563eb' : '#f1f5f9'}
              trackColor={{ false: '#cbd5f5', true: '#93c5fd' }}
              ios_backgroundColor="#cbd5f5"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationSettings;
