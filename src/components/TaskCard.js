import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TouchableOpacity, View } from 'react-native';

import { taskStyles } from '../styles/styles';

const TaskCard = ({ task, onToggle, onRemove }) => (
  <View style={[taskStyles.card, task.completed && taskStyles.cardCompleted]}>
    <TouchableOpacity
      onPress={onToggle}
      style={taskStyles.checkbox}
      accessibilityRole="button"
      accessibilityLabel={`Mark ${task.title} as ${
        task.completed ? 'incomplete' : 'complete'
      }`}
    >
      <Ionicons
        name={task.completed ? 'checkbox' : 'square-outline'}
        size={22}
        color={task.completed ? '#2563eb' : '#6b7280'}
      />
    </TouchableOpacity>
    <View style={taskStyles.content}>
      <Text
        style={[taskStyles.title, task.completed && taskStyles.titleCompleted]}
        accessibilityRole="text"
      >
        {task.title}
      </Text>
    </View>
    <TouchableOpacity
      onPress={onRemove}
      style={taskStyles.removeButton}
      accessibilityRole="button"
      accessibilityLabel={`Delete ${task.title}`}
    >
      <Ionicons name="trash-outline" size={20} color="#dc2626" />
    </TouchableOpacity>
  </View>
);

export default TaskCard;
