import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

export const calendarStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  keyboardAvoider: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitles: {
    flex: 1,
    marginRight: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
  },
  subheading: {
    marginTop: 6,
    fontSize: 16,
    color: '#475569',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  headerButtonDisabled: {
    backgroundColor: '#e2e8f0',
    opacity: 0.6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '92vh',
    alignSelf: 'stretch',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modalBody: {
    flex: 1,
    paddingBottom: 20,
  },
  modalTabButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalTabButtonActive: {
    backgroundColor: '#fff',
  },
  modalTabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalTabLabelActive: {
    color: '#0f172a',
  },
  pressablePressed: {
    opacity: 0.75,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingCopy: {
    flex: 1,
    marginRight: 12,
  },
  switchWrapper: {
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 64,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  settingSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  settingWarning: {
    marginTop: 8,
    fontSize: 12,
    color: '#dc2626',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  modalPrimaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalPrimaryButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  modalPrimaryLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  modalSecondaryLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleEditorSection: {
    width: '100%',
    marginTop: 12,
    flexGrow: 1,
    flexShrink: 1,
  },
  scheduleTypeTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  scheduleTypeButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  scheduleTypeButtonActive: {
    backgroundColor: '#2563eb',
  },
  scheduleTypeLabel: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  scheduleTypeLabelActive: {
    color: '#fff',
  },
  scheduleEditorList: {
    width: '100%',
    marginBottom: 16,
  },
  scheduleEditorContent: {
    paddingBottom: 16,
    gap: 12,
  },
  scheduleEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#fff',
    gap: 12,
    marginBottom: 12,
  },
  scheduleEditInputs: {
    flex: 1,
    gap: 8,
  },
  scheduleEditTime: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  scheduleEditActivity: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  scheduleEditRemove: {
    padding: 6,
  },
  scheduleEditorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scheduleActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
  },
  scheduleActionLabel: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
});

export const dayStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 50,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    marginBottom: 12,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e0e7ff',
    marginBottom: 8,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  dayTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  dayTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  dayTypeOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  dayTypeLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#475569',
  },
  dayTypeLabelSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1f2937',
  },
  primaryButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    marginLeft: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 40,
    color: '#94a3b8',
    fontSize: 16,
  },
  scheduleSection: {
    marginTop: 16,
  },
  scheduleHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  scheduleRowCompleted: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  scheduleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  scheduleActions: {
    alignItems: 'flex-end',
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  scheduleActivity: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  scheduleTimerText: {
    marginTop: 6,
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  scheduleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  scheduleButtonRunning: {
    backgroundColor: '#1e3a8a',
  },
  scheduleButtonCompleted: {
    backgroundColor: '#9ca3af',
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleButtonTextCompleted: {
    color: '#f8fafc',
  },
  tasksSection: {
    marginTop: 24,
  },
  taskList: {
    gap: 12,
    paddingBottom: 32,
  },
  tasksHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
});

export const taskStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#111827',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  timerText: {
    marginTop: 4,
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  timerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    marginRight: 8,
  },
  timerButtonActive: {
    backgroundColor: '#1e3a8a',
  },
  timerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timerButtonTextDisabled: {
    color: '#f8fafc',
  },
  removeButton: {
    padding: 4,
  },
});
