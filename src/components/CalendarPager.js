import { useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';

import { initialTasks } from '../constants/initialTasks';
import { useCalendarState } from '../hooks/useCalendarState';
import { calendarStyles } from '../styles/styles';
import { formatLongDate } from '../utils/date';
import CalendarHeader from './CalendarHeader';
import DayPage from './DayPage';

const CalendarPager = () => {
  const { width } = useWindowDimensions();
  const {
    dates,
    currentIndex,
    setCurrentIndex,
    appendNextDate,
    handleInputChange,
    handleAddTaskForDate,
    toggleTaskCompletion,
    removeTask,
    getTasksForDate,
    getInputValueForDate,
    currentDateEntry,
    remainingTasks,
  } = useCalendarState(initialTasks);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      const nextIndex = viewableItems[0].index ?? 0;
      setCurrentIndex(nextIndex);
    }
  });

  const headerSubtitle = currentDateEntry
    ? `${formatLongDate(currentDateEntry.date)} • ${
        remainingTasks === 0
          ? 'All tasks completed'
          : `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} remaining`
      }`
    : 'Preparing your schedule...';

  return (
    <KeyboardAvoidingView
      style={calendarStyles.keyboardAvoider}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CalendarHeader title="Tasker" subtitle={headerSubtitle} />
      <FlatList
        data={dates}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <DayPage
            width={width}
            dateEntry={item}
            tasks={getTasksForDate(item.key)}
            inputValue={getInputValueForDate(item.key)}
            onInputChange={(value) => handleInputChange(item.key, value)}
            onAddTask={() => handleAddTaskForDate(item.key)}
            onToggleTask={(taskId) => toggleTaskCompletion(item.key, taskId)}
            onRemoveTask={(taskId) => removeTask(item.key, taskId)}
          />
        )}
        horizontal
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onEndReached={appendNextDate}
        onEndReachedThreshold={0.6}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </KeyboardAvoidingView>
  );
};

export default CalendarPager;
