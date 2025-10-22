import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onValue, ref, set } from 'firebase/database';

import { database } from '../lib/firebase';
import { offDaySchedule } from '../constants/offDaySchedule';
import { workDaySchedule } from '../constants/workDaySchedule';

const STORAGE_KEY = '@tasker/schedules';
const FIREBASE_TEMPLATE_PATH = 'scheduleDefinitions';
const FIREBASE_COMPLETION_ROOT = 'scheduleTemplates';

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
  recordScheduleCompletion: () => {},
  clearScheduleCompletion: () => {},
  clearScheduleCompletionForDate: () => {},
  observeScheduleCompletions: () => () => {},
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

const formatDateForPath = (dateKey, dateValue) => {
  let baseDate = null;

  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    baseDate = new Date(dateValue.getTime());
  } else if (dateKey) {
    const parsed = new Date(`${dateKey}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  if (!baseDate) {
    return dateKey ? dateKey.replace(/[^0-9A-Za-z]/g, '_') : '';
  }

  baseDate.setHours(0, 0, 0, 0);

  const month = baseDate.toLocaleDateString('en-US', { month: 'long' });
  const day = String(baseDate.getDate());
  const year = baseDate.getFullYear();
  return `${month}${day}_${year}`;
};

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState({
    work: workDaySchedule,
    off: offDaySchedule,
  });
  const isRemoteReadyRef = useRef(false);
  const pendingRemoteSyncRef = useRef(null);
  const templateRef = useRef(ref(database, FIREBASE_TEMPLATE_PATH));

  const persistLocal = useCallback((nextSchedules) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSchedules)).catch(() => {});
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
      .catch(() => {});
  }, []);

  const persistRemote = useCallback((nextSchedules) => {
    const scheduleRef = templateRef.current;
    if (!isRemoteReadyRef.current) {
      pendingRemoteSyncRef.current = nextSchedules;
      return;
    }

    set(scheduleRef, nextSchedules).catch(() => {
      pendingRemoteSyncRef.current = nextSchedules;
    });
  }, []);

  useEffect(() => {
    const scheduleRef = templateRef.current;
    const unsubscribe = onValue(
      scheduleRef,
      (snapshot) => {
        const value = snapshot.val();
        const nextSchedules = value
          ? hydrateSchedules(value)
          : {
              work: [...workDaySchedule],
              off: [...offDaySchedule],
            };

        setSchedules(nextSchedules);
        persistLocal(nextSchedules);

        if (!value) {
          set(scheduleRef, nextSchedules).catch(() => {});
        }

        isRemoteReadyRef.current = true;

        if (pendingRemoteSyncRef.current) {
          const pending = pendingRemoteSyncRef.current;
          pendingRemoteSyncRef.current = null;
          set(scheduleRef, pending).catch(() => {
            pendingRemoteSyncRef.current = pending;
          });
        }
      },
      () => {
        isRemoteReadyRef.current = true;
      },
    );

    return () => {
      unsubscribe();
      isRemoteReadyRef.current = false;
    };
  }, [persistLocal]);

  const setAndPersist = useCallback(
    (updater) => {
      setSchedules((prev) => {
        const next = updater(prev);
        persistLocal(next);
        persistRemote(next);
        return next;
      });
    },
    [persistLocal, persistRemote],
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

  const resetDefaults = useCallback(
    (dayType) => {
      setAndPersist((prev) => ({
        ...prev,
        [dayType]:
          dayType === 'work'
            ? [...workDaySchedule]
            : dayType === 'off'
            ? [...offDaySchedule]
            : prev[dayType],
      }));
    },
    [setAndPersist],
  );

  const setSchedule = useCallback(
    (dayType, list) => {
      setAndPersist((prev) => ({
        ...prev,
        [dayType]: sanitizeScheduleList(list),
      }));
    },
    [setAndPersist],
  );

  const recordScheduleCompletion = useCallback(
    (dateKey, dayType, scheduleIndex, scheduleItem, dateValue) => {
      if (
        !dateKey ||
        !dayType ||
        !Number.isInteger(scheduleIndex) ||
        scheduleIndex < 0
      ) {
        return;
      }

      const formattedDate = formatDateForPath(dateKey, dateValue);
      if (!formattedDate) {
        return;
      }

      const normalized = normalizeScheduleItem(scheduleItem);
      if (!normalized.time || !normalized.activity) {
        return;
      }

      const completionRef = ref(
        database,
        `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}/${scheduleIndex}`,
      );

      set(completionRef, { ...normalized, status: true }).catch(() => {});
    },
    [],
  );

  const clearScheduleCompletion = useCallback(
    (dateKey, dayType, scheduleIndex, dateValue) => {
      if (
        !dateKey ||
        !dayType ||
        !Number.isInteger(scheduleIndex) ||
        scheduleIndex < 0
      ) {
        return;
      }

      const formattedDate = formatDateForPath(dateKey, dateValue);
      if (!formattedDate) {
        return;
      }

      const completionRef = ref(
        database,
        `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}/${scheduleIndex}`,
      );

      set(completionRef, null).catch(() => {});
    },
    [],
  );

  const clearScheduleCompletionForDate = useCallback(
    (dateKey, dateValue, dayType) => {
      if (!dateKey) {
        return;
      }

      const formattedDate = formatDateForPath(dateKey, dateValue);
      if (!formattedDate) {
        return;
      }

      const path = dayType
        ? `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}`
        : `${FIREBASE_COMPLETION_ROOT}/${formattedDate}`;
      const targetRef = ref(database, path);
      set(targetRef, null).catch(() => {});
    },
    [],
  );

  const observeScheduleCompletions = useCallback(
    (dateKey, dateValue, handler) => {
      const formattedDate = formatDateForPath(dateKey, dateValue);
      if (!formattedDate) {
        handler?.(null);
        return () => {};
      }

      const completionsRef = ref(
        database,
        `${FIREBASE_COMPLETION_ROOT}/${formattedDate}`,
      );

      return onValue(completionsRef, (snapshot) => {
        handler?.(snapshot.val());
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      schedules,
      updateItem,
      addItem,
      removeItem,
      resetDefaults,
      setSchedule,
      recordScheduleCompletion,
      clearScheduleCompletion,
      clearScheduleCompletionForDate,
      observeScheduleCompletions,
    }),
    [
      schedules,
      updateItem,
      addItem,
      removeItem,
      resetDefaults,
      setSchedule,
      recordScheduleCompletion,
      clearScheduleCompletion,
      clearScheduleCompletionForDate,
      observeScheduleCompletions,
    ],
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedules = () => useContext(ScheduleContext);
