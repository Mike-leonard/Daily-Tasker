import Ionicons from '@expo/vector-icons/Ionicons';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  formatBadgeLabel,
  formatLongDate,
  formatWeekday,
} from '../utils/date';
import { dayStyles } from '../styles/styles';
import TaskCard from './TaskCard';

const DayPage = ({
  dateEntry,
  tasks,
  inputValue,
  onInputChange,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  width,
}) => {
  const incompleteCount = tasks.filter((task) => !task.completed).length;

  const renderTask = ({ item }) => (
    <TaskCard
      task={item}
      onToggle={() => onToggleTask(item.id)}
      onRemove={() => onRemoveTask(item.id)}
    />
  );

  return (
    <View style={[dayStyles.page, { width }]}>
      <View style={dayStyles.content}>
        <View style={dayStyles.header}>
          <View style={dayStyles.dateBadge}>
            <Text style={dayStyles.dateBadgeText}>
              {formatBadgeLabel(dateEntry.date)}
            </Text>
          </View>
          <Text style={dayStyles.title}>{formatWeekday(dateEntry.date)}</Text>
          <Text style={dayStyles.subtitle}>{formatLongDate(dateEntry.date)}</Text>
          <Text style={dayStyles.summary}>
            {tasks.length === 0
              ? 'No tasks scheduled yet.'
              : incompleteCount === 0
              ? 'All tasks completed for this day.'
              : `${incompleteCount} of ${tasks.length} remaining`}
          </Text>
        </View>

        <View style={dayStyles.inputRow}>
          <TextInput
            value={inputValue}
            onChangeText={onInputChange}
            placeholder="Add a task for this date..."
            placeholderTextColor="#9ca3af"
            style={dayStyles.input}
            returnKeyType="done"
            onSubmitEditing={onAddTask}
          />
          <TouchableOpacity
            style={dayStyles.primaryButton}
            onPress={onAddTask}
            accessibilityRole="button"
            accessibilityLabel={`Add task for ${formatLongDate(dateEntry.date)}`}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(task) => task.id}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={dayStyles.listContent}
          ListEmptyComponent={
            <Text style={dayStyles.emptyState}>
              Plan something for this day to keep momentum going.
            </Text>
          }
          nestedScrollEnabled
        />
      </View>
    </View>
  );
};

export default DayPage;
