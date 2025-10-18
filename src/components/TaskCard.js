import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TouchableOpacity, View } from 'react-native';

import { taskStyles } from '../styles/styles';
import { formatDuration } from '../utils/time';

const TaskCard = ({ task, timer, onToggle, onRemove, onStart }) => {
  const timerRunning = Boolean(timer?.isRunning);
  const timerLabel = timerRunning ? formatDuration(timer.remainingMs) : null;
  const buttonLabel = task.completed
    ? 'Done'
    : timerRunning
    ? timerLabel ?? 'Running'
    : 'Start';

  return (
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
        {timerRunning && (
          <Text style={taskStyles.timerText}>Focus timer: {timerLabel}</Text>
        )}
      </View>
      <View style={taskStyles.actions}>
        <TouchableOpacity
          onPress={onStart}
          style={[
            taskStyles.timerButton,
            timerRunning && taskStyles.timerButtonActive,
            task.completed && taskStyles.timerButtonDisabled,
          ]}
          disabled={task.completed}
          accessibilityRole="button"
          accessibilityLabel={`Start focus timer for ${task.title}`}
        >
          <Text
            style={[
              taskStyles.timerButtonText,
              task.completed && taskStyles.timerButtonTextDisabled,
            ]}
          >
            {buttonLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRemove}
          style={taskStyles.removeButton}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
        >
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskCard;
