import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { offDaySchedule } from '../constants/offDaySchedule';
import { workDaySchedule } from '../constants/workDaySchedule';

const STORAGE_KEY = '@tasker/schedules';

const ScheduleContext = createContext({
  schedules: {
    work: workDaySchedule,
    off: offDaySchedule,
  },
  updateItem: () => {},
  addItem: () => {},
  removeItem: () => {},
  resetDefaults: () => {},
  setSchedule: () => {},
});

const normalizeScheduleItem = (item) => ({
  time: item?.time?.trim() ?? '',
  activity: item?.activity?.trim() ?? '',
});

const sanitizeScheduleList = (list) =>
  list
    .map(normalizeScheduleItem)
    .filter((item) => item.time && item.activity);

const hydrateSchedules = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      work: workDaySchedule,
      off: offDaySchedule,
    };
  }

  return {
    work: sanitizeScheduleList(raw.work ?? workDaySchedule),
    off: sanitizeScheduleList(raw.off ?? offDaySchedule),
  };
};

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState({
    work: workDaySchedule,
    off: offDaySchedule,
  });
  const isLoadedRef = useRef(false);

  const persist = useCallback(async (nextSchedules) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSchedules));
    } catch (error) {
      // ignore persistence errors for now
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) {
          return;
        }
        const parsed = JSON.parse(stored);
        setSchedules(hydrateSchedules(parsed));
      })
      .catch(() => {})
      .finally(() => {
        isLoadedRef.current = true;
      });
  }, []);

  const setAndPersist = useCallback(
    (updater) => {
      setSchedules((prev) => {
        const next = updater(prev);
        if (isLoadedRef.current) {
          persist(next);
        } else {
          // ensure we persist after initial load completes
          setTimeout(() => persist(next), 0);
        }
        return next;
      });
    },
    [persist],
  );

  const updateItem = useCallback(
    (dayType, index, updates) => {
      setAndPersist((prev) => {
        const list = prev[dayType] ?? [];
        if (!list[index]) {
          return prev;
        }
        const nextList = [...list];
        nextList[index] = normalizeScheduleItem({
          ...nextList[index],
          ...updates,
        });
        return { ...prev, [dayType]: sanitizeScheduleList(nextList) };
      });
    },
    [setAndPersist],
  );

  const addItem = useCallback(
    (dayType, item) => {
      setAndPersist((prev) => {
        const list = prev[dayType] ?? [];
        const nextItem = normalizeScheduleItem(item);
        if (!nextItem.time || !nextItem.activity) {
          return prev;
        }
        return {
          ...prev,
          [dayType]: [...list, nextItem],
        };
      });
    },
    [setAndPersist],
  );

  const removeItem = useCallback(
    (dayType, index) => {
      setAndPersist((prev) => {
        const list = prev[dayType] ?? [];
        if (!list[index]) {
          return prev;
        }
        const nextList = list.filter((_, idx) => idx !== index);
        return { ...prev, [dayType]: nextList };
      });
    },
    [setAndPersist],
  );

  const resetDefaults = useCallback((dayType) => {
    setAndPersist((prev) => ({
      ...prev,
      [dayType]:
        dayType === 'work'
          ? [...workDaySchedule]
          : dayType === 'off'
          ? [...offDaySchedule]
          : prev[dayType],
    }));
  }, [setAndPersist]);

  const setSchedule = useCallback(
    (dayType, list) => {
      setAndPersist((prev) => ({
        ...prev,
        [dayType]: sanitizeScheduleList(list),
      }));
    },
    [setAndPersist],
  );

  const value = useMemo(
    () => ({
      schedules,
      updateItem,
      addItem,
      removeItem,
      resetDefaults,
      setSchedule,
    }),
    [schedules, updateItem, addItem, removeItem, resetDefaults, setSchedule],
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedules = () => useContext(ScheduleContext);
