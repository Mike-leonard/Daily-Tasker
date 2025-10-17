import { useCallback, useMemo, useState } from 'react';

import { addDays, dateKeyFromDate, generateDates } from '../utils/date';
import { createTaskId } from '../utils/tasks';

const INITIAL_DAYS = 7;

export const useCalendarState = (initialTasks = [], initialDayCount = INITIAL_DAYS) => {
  const initialDates = useMemo(
    () => generateDates(new Date(), initialDayCount),
    [initialDayCount],
  );

  const [dates, setDates] = useState(initialDates);
  const [tasksByDate, setTasksByDate] = useState(() => {
    const firstKey = initialDates[0]?.key;
    return firstKey ? { [firstKey]: initialTasks } : {};
  });
  const [inputValues, setInputValues] = useState(() => {
    const firstKey = initialDates[0]?.key;
    return firstKey ? { [firstKey]: '' } : {};
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const ensureDateState = useCallback((dateKey) => {
    setTasksByDate((prev) =>
      Object.prototype.hasOwnProperty.call(prev, dateKey)
        ? prev
        : { ...prev, [dateKey]: [] },
    );
    setInputValues((prev) =>
      Object.prototype.hasOwnProperty.call(prev, dateKey)
        ? prev
        : { ...prev, [dateKey]: '' },
    );
  }, []);

  const appendNextDate = useCallback(() => {
    setDates((prevDates) => {
      const lastDate = prevDates[prevDates.length - 1]?.date ?? new Date();
      const nextDate = addDays(lastDate, 1);
      const nextKey = dateKeyFromDate(nextDate);
      ensureDateState(nextKey);
      return [...prevDates, { key: nextKey, date: nextDate }];
    });
  }, [ensureDateState]);

  const handleInputChange = useCallback((dateKey, value) => {
    setInputValues((prev) => ({ ...prev, [dateKey]: value }));
  }, []);

  const handleAddTaskForDate = useCallback(
    (dateKey) => {
      const rawValue = inputValues[dateKey] ?? '';
      const trimmed = rawValue.trim();
      if (!trimmed) {
        return;
      }

      setTasksByDate((prev) => {
        const existing = prev[dateKey] ?? [];
        return {
          ...prev,
          [dateKey]: [
            ...existing,
            {
              id: createTaskId(dateKey),
              title: trimmed,
              completed: false,
            },
          ],
        };
      });

      setInputValues((prev) => ({ ...prev, [dateKey]: '' }));
    },
    [inputValues],
  );

  const toggleTaskCompletion = useCallback((dateKey, taskId) => {
    setTasksByDate((prev) => {
      const dayTasks = prev[dateKey];
      if (!dayTasks) {
        return prev;
      }

      return {
        ...prev,
        [dateKey]: dayTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      };
    });
  }, []);

  const removeTask = useCallback((dateKey, taskId) => {
    setTasksByDate((prev) => {
      const dayTasks = prev[dateKey];
      if (!dayTasks) {
        return prev;
      }

      return {
        ...prev,
        [dateKey]: dayTasks.filter((task) => task.id !== taskId),
      };
    });
  }, []);

  const getTasksForDate = useCallback(
    (dateKey) => tasksByDate[dateKey] ?? [],
    [tasksByDate],
  );

  const getInputValueForDate = useCallback(
    (dateKey) => inputValues[dateKey] ?? '',
    [inputValues],
  );

  const currentDateEntry = dates[currentIndex] ?? dates[0];
  const currentTasks = currentDateEntry
    ? getTasksForDate(currentDateEntry.key)
    : [];
  const remainingTasks = currentTasks.filter((task) => !task.completed).length;

  return {
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
  };
};
