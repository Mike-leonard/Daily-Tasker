import { StyleSheet } from 'react-native';

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

export const calendarStyles = StyleSheet.create({
  keyboardAvoider: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
});

export const dayStyles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
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
  subtitle: {
    marginTop: 2,
    fontSize: 16,
    color: '#475569',
  },
  summary: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
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
  removeButton: {
    padding: 4,
  },
});
