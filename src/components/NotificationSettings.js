import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { calendarStyles } from '../styles/styles';
import { useNotificationSettings } from '../context/NotificationContext';
import { useSchedules } from '../context/ScheduleContext';
import { offDaySchedule } from '../constants/offDaySchedule';
import { workDaySchedule } from '../constants/workDaySchedule';

const tabs = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'schedules', label: 'Schedules' },
];

const dayTypeOptions = [
  { id: 'work', label: 'Work Day' },
  { id: 'off', label: 'Off Day' },
];

const defaultSchedulesByType = {
  work: workDaySchedule,
  off: offDaySchedule,
};

const cloneSchedules = (schedules) => ({
  work: (schedules.work ?? []).map((item) => ({ ...item })),
  off: (schedules.off ?? []).map((item) => ({ ...item })),
});

const ensureRow = (item = {}) => ({
  time: item.time ?? '',
  activity: item.activity ?? '',
});

const NotificationSettings = ({ visible, onRequestClose, onSchedulesUpdated }) => {
  const { enabled, toggleNotifications, permissionStatus } =
    useNotificationSettings();
  const { schedules, setSchedule } = useSchedules();

  const { height: windowHeight } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('notifications');
  const [selectedDayType, setSelectedDayType] = useState('work');
  const [drafts, setDrafts] = useState(() => cloneSchedules(schedules));
  const [dirtyMap, setDirtyMap] = useState({ work: false, off: false });
  const hasChanges = dirtyMap.work || dirtyMap.off;

  useEffect(() => {
    if (visible) {
      setDrafts(cloneSchedules(schedules));
      setActiveTab('notifications');
      setSelectedDayType('work');
      setDirtyMap({ work: false, off: false });
    }
  }, [visible, schedules]);

  const handleToggle = async () => {
    const success = await toggleNotifications();
    if (!success && !enabled) {
      onRequestClose?.();
    }
  };

  const updateDraft = (dayType, index, field, value) => {
    setDrafts((prev) => {
      const next = cloneSchedules(prev);
      if (!next[dayType][index]) {
        next[dayType][index] = ensureRow();
      }
      next[dayType][index] = {
        ...next[dayType][index],
        [field]: value,
      };
      return next;
    });
    setDirtyMap((prev) => ({ ...prev, [dayType]: true }));
  };

  const handleAddRow = (dayType) => {
    setDrafts((prev) => {
      const next = cloneSchedules(prev);
      next[dayType] = [...next[dayType], ensureRow({ time: '', activity: '' })];
      return next;
    });
    setDirtyMap((prev) => ({ ...prev, [dayType]: true }));
  };

  const handleRemoveRow = (dayType, index) => {
    setDrafts((prev) => {
      const next = cloneSchedules(prev);
      next[dayType] = next[dayType].filter((_, idx) => idx !== index);
      return next;
    });
    setDirtyMap((prev) => ({ ...prev, [dayType]: true }));
  };

  const handleResetDayType = (dayType) => {
    setDrafts((prev) => {
      const next = cloneSchedules(prev);
      next[dayType] = defaultSchedulesByType[dayType].map((item) => ({ ...item }));
      return next;
    });
    setDirtyMap((prev) => ({ ...prev, [dayType]: true }));
  };

  const sanitizedDraft = useMemo(
    () => ({
      work: drafts.work
        .map(ensureRow)
        .filter((item) => item.time.trim() && item.activity.trim()),
      off: drafts.off
        .map(ensureRow)
        .filter((item) => item.time.trim() && item.activity.trim()),
    }),
    [drafts],
  );

  const handleSave = () => {
    if (dirtyMap.work) {
      setSchedule('work', sanitizedDraft.work);
      onSchedulesUpdated?.('work');
    }
    if (dirtyMap.off) {
      setSchedule('off', sanitizedDraft.off);
      onSchedulesUpdated?.('off');
    }
    setDirtyMap({ work: false, off: false });
    onRequestClose?.();
  };

  const renderNotificationSettings = () => (
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
  );

  const renderScheduleEditor = () => {
    const current = drafts[selectedDayType] ?? [];

    return (
      <View style={calendarStyles.scheduleEditorSection}>
        <View style={calendarStyles.scheduleTypeTabs}>
          {dayTypeOptions.map((option) => {
            const selected = option.id === selectedDayType;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  calendarStyles.scheduleTypeButton,
                  selected && calendarStyles.scheduleTypeButtonActive,
                ]}
                onPress={() => setSelectedDayType(option.id)}
              >
                <Text
                  style={[
                    calendarStyles.scheduleTypeLabel,
                    selected && calendarStyles.scheduleTypeLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={calendarStyles.scheduleEditorList}
          contentContainerStyle={calendarStyles.scheduleEditorContent}
        >
          {current.length === 0 && (
            <Text style={calendarStyles.settingSubtitle}>
              No entries yet. Add one to build your plan.
            </Text>
          )}
          {current.map((item, index) => (
            <View key={`${selectedDayType}-${index}`} style={calendarStyles.scheduleEditRow}>
              <View style={calendarStyles.scheduleEditInputs}>
                <TextInput
                  value={item.time}
                  onChangeText={(value) => updateDraft(selectedDayType, index, 'time', value)}
                  placeholder="08:00 – 09:00"
                  placeholderTextColor="#94a3b8"
                  style={calendarStyles.scheduleEditTime}
                />
                <TextInput
                  value={item.activity}
                  onChangeText={(value) =>
                    updateDraft(selectedDayType, index, 'activity', value)
                  }
                  placeholder="Describe the activity"
                  placeholderTextColor="#94a3b8"
                  style={calendarStyles.scheduleEditActivity}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveRow(selectedDayType, index)}
                style={calendarStyles.scheduleEditRemove}
                accessibilityRole="button"
                accessibilityLabel="Remove entry"
              >
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={calendarStyles.scheduleEditorActions}>
          <TouchableOpacity
            onPress={() => handleAddRow(selectedDayType)}
            style={calendarStyles.scheduleActionButton}
          >
            <Ionicons name="add" size={18} color="#2563eb" />
            <Text style={calendarStyles.scheduleActionLabel}>Add entry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleResetDayType(selectedDayType)}
            style={calendarStyles.scheduleActionButton}
          >
            <Ionicons name="refresh" size={18} color="#2563eb" />
            <Text style={calendarStyles.scheduleActionLabel}>Reset defaults</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={calendarStyles.modalBackdrop}>
        <View
          style={[
            calendarStyles.modalCard,
            { maxHeight: windowHeight * 0.92 },
          ]}
        >
          <View style={calendarStyles.modalHeader}>
            <Text style={calendarStyles.modalTitle}>Settings</Text>
            <Pressable
              onPress={onRequestClose}
              accessibilityRole="button"
              accessibilityLabel="Close settings"
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color="#0f172a" />
            </Pressable>
          </View>

          <View style={calendarStyles.modalTabs}>
            {tabs.map((tab) => {
              const selected = tab.id === activeTab;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    calendarStyles.modalTabButton,
                    selected && calendarStyles.modalTabButtonActive,
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text
                    style={[
                      calendarStyles.modalTabLabel,
                      selected && calendarStyles.modalTabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={calendarStyles.modalScroll}
            contentContainerStyle={calendarStyles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === 'notifications'
              ? renderNotificationSettings()
              : renderScheduleEditor()}
          </ScrollView>

          <View style={calendarStyles.modalFooter}>
            <TouchableOpacity
              onPress={onRequestClose}
              style={calendarStyles.modalSecondaryButton}
            >
              <Text style={calendarStyles.modalSecondaryLabel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[
                calendarStyles.modalPrimaryButton,
                !hasChanges && calendarStyles.modalPrimaryButtonDisabled,
              ]}
              disabled={!hasChanges}
            >
              <Text style={calendarStyles.modalPrimaryLabel}>Save changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationSettings;
