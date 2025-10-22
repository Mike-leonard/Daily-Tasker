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
  const [dayTypeByDate, setDayTypeByDate] = useState(() => {
    const firstKey = initialDates[0]?.key;
    return firstKey ? { [firstKey]: 'work' } : {};
  });
  const [scheduleCompletionByDate, setScheduleCompletionByDate] = useState(() => {
    const firstKey = initialDates[0]?.key;
    return firstKey ? { [firstKey]: {} } : {};
  });

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
    setDayTypeByDate((prev) =>
      Object.prototype.hasOwnProperty.call(prev, dateKey)
        ? prev
        : { ...prev, [dateKey]: 'work' },
    );
    setScheduleCompletionByDate((prev) =>
      Object.prototype.hasOwnProperty.call(prev, dateKey)
        ? prev
        : { ...prev, [dateKey]: {} },
    );
  }, []);

  const appendNextDate = useCallback(() => {
    setDates((prevDates) => {
      const lastDate = prevDates[prevDates.length - 1]?.date ?? new Date();
      const nextDate = addDays(lastDate, 1);
      const nextKey = dateKeyFromDate(nextDate);
      if (prevDates.some((entry) => entry.key === nextKey)) {
        return prevDates;
      }
      ensureDateState(nextKey);
      return [...prevDates, { key: nextKey, date: nextDate }];
    });
  }, [ensureDateState]);

  const prependPreviousDate = useCallback(() => {
    setDates((prevDates) => {
      const firstDate = prevDates[0]?.date ?? new Date();
      const previousDate = addDays(firstDate, -1);
      const previousKey = dateKeyFromDate(previousDate);
      if (prevDates.some((entry) => entry.key === previousKey)) {
        return prevDates;
      }
      ensureDateState(previousKey);
      setCurrentIndex((prevIndex) => prevIndex + 1);
      return [{ key: previousKey, date: previousDate }, ...prevDates];
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

  const completeTask = useCallback((dateKey, taskId) => {
    setTasksByDate((prev) => {
      const dayTasks = prev[dateKey];
      if (!dayTasks) {
        return prev;
      }
      const alreadyComplete = dayTasks.every((task) => task.id !== taskId || task.completed);
      if (alreadyComplete) {
        return prev;
      }
      return {
        ...prev,
        [dateKey]: dayTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task,
        ),
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

  const getDayTypeForDate = useCallback(
    (dateKey) => dayTypeByDate[dateKey] ?? 'work',
    [dayTypeByDate],
  );

  const setDayTypeForDate = useCallback((dateKey, type) => {
    setDayTypeByDate((prev) => {
      if (prev[dateKey] === type) {
        return prev;
      }

      setScheduleCompletionByDate((schedulePrev) => ({
        ...schedulePrev,
        [dateKey]: {},
      }));

      return {
        ...prev,
        [dateKey]: type,
      };
    });
  }, [setScheduleCompletionByDate]);

  const currentDateEntry = dates[currentIndex] ?? dates[0];

  const isScheduleCompleted = useCallback(
    (dateKey, scheduleId) =>
      Boolean(scheduleCompletionByDate[dateKey]?.[scheduleId]),
    [scheduleCompletionByDate],
  );

  const markScheduleCompleted = useCallback((dateKey, scheduleId) => {
    setScheduleCompletionByDate((prev) => {
      const dayState = prev[dateKey] ?? {};
      if (dayState[scheduleId]) {
        return prev;
      }
      return {
        ...prev,
        [dateKey]: {
          ...dayState,
          [scheduleId]: true,
        },
      };
    });
  }, []);

  const resetScheduleCompletion = useCallback((dateKey, scheduleId) => {
    setScheduleCompletionByDate((prev) => {
      const dayState = prev[dateKey];
      if (!dayState?.[scheduleId]) {
        return prev;
      }

      const { [scheduleId]: _removed, ...restDayState } = dayState;
      return {
        ...prev,
        [dateKey]: restDayState,
      };
    });
  }, []);

  const resetScheduleCompletionForDate = useCallback((dateKey) => {
    setScheduleCompletionByDate((prev) => {
      if (!prev[dateKey] || Object.keys(prev[dateKey]).length === 0) {
        return prev;
      }
      return {
        ...prev,
        [dateKey]: {},
      };
    });
  }, []);

  const replaceScheduleCompletionForDate = useCallback((dateKey, completionMap) => {
    setScheduleCompletionByDate((prev) => {
      if (!dateKey) {
        return prev;
      }
      return {
        ...prev,
        [dateKey]: completionMap ?? {},
      };
    });
  }, []);

  const removeDate = useCallback(
    (dateKey) => {
      setDates((prevDates) => {
        if (prevDates.length <= 1) {
          return prevDates;
        }

        const index = prevDates.findIndex((entry) => entry.key === dateKey);
        if (index === -1) {
          return prevDates;
        }

        const nextDates = prevDates.filter((entry) => entry.key !== dateKey);

        setCurrentIndex((prevIndex) => {
          if (prevIndex > index) {
            return prevIndex - 1;
          }
          if (prevIndex === index) {
            return Math.max(0, prevIndex - 1);
          }
          return prevIndex;
        });

        setTasksByDate((prev) => {
          const { [dateKey]: _removed, ...rest } = prev;
          return rest;
        });

        setInputValues((prev) => {
          const { [dateKey]: _removed, ...rest } = prev;
          return rest;
        });

        setDayTypeByDate((prev) => {
          const { [dateKey]: _removed, ...rest } = prev;
          return rest;
        });

        setScheduleCompletionByDate((prev) => {
          const { [dateKey]: _removed, ...rest } = prev;
          return rest;
        });

        return nextDates;
      });
    },
    [],
  );

  return {
    dates,
    currentIndex,
    setCurrentIndex,
    appendNextDate,
    handleInputChange,
    handleAddTaskForDate,
    toggleTaskCompletion,
    removeTask,
    completeTask,
    getTasksForDate,
    getInputValueForDate,
    getDayTypeForDate,
    setDayTypeForDate,
    currentDateEntry,
    isScheduleCompleted,
    markScheduleCompleted,
    resetScheduleCompletion,
    resetScheduleCompletionForDate,
    replaceScheduleCompletionForDate,
    prependPreviousDate,
    removeDate,
  };
};
