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
import { get, onValue, ref, set } from 'firebase/database';

import { database } from '../lib/firebase';
import { offDaySchedule } from '../constants/offDaySchedule';
import { workDaySchedule } from '../constants/workDaySchedule';
import { FIREBASE_COMPLETION_ROOT, FIREBASE_TEMPLATE_PATH } from '../constants/firebasePaths';
import { createScheduleItemId } from '../utils/id';

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
  recordScheduleCompletion: () => {},
  clearScheduleCompletion: () => {},
  clearScheduleCompletionForDate: () => {},
  observeScheduleCompletions: () => () => {},
});

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 18);

const deriveDeterministicId = (dayType, time, activity) => {
  if (!time || !activity) {
    return null;
  }
  return `${dayType}-${slugify(time)}-${slugify(activity)}`;
};

const normalizeScheduleItem = (dayType, item) => {
  const time = item?.time?.trim() ?? '';
  const activity = item?.activity?.trim() ?? '';
  const id =
    typeof item?.id === 'string' && item.id.trim().length > 0
      ? item.id.trim()
      : deriveDeterministicId(dayType, time, activity) ??
        createScheduleItemId(dayType);

  return {
    id,
    time,
    activity,
  };
};

const sanitizeScheduleList = (dayType, list = []) => {
  const seen = new Set();

  return list
    .map((item) => {
      let normalized = normalizeScheduleItem(dayType, item);
      if (!normalized.time || !normalized.activity) {
        return null;
      }
      while (seen.has(normalized.id)) {
        normalized = {
          ...normalized,
          id: createScheduleItemId(dayType),
        };
      }
      seen.add(normalized.id);
      return normalized;
    })
    .filter(Boolean);
};

const hydrateSchedules = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      work: sanitizeScheduleList('work', workDaySchedule),
      off: sanitizeScheduleList('off', offDaySchedule),
    };
  }

  return {
    work: sanitizeScheduleList('work', raw.work ?? workDaySchedule),
    off: sanitizeScheduleList('off', raw.off ?? offDaySchedule),
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

const removeLegacyCompletionEntries = (formattedDate, dayType, predicate) => {
  if (!formattedDate || !dayType || typeof predicate !== 'function') {
    return;
  }

  const dayTypePath = `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}`;
  const dayRef = ref(database, dayTypePath);

  get(dayRef)
    .then((snapshot) => {
      const value = snapshot.val();
      if (!value || typeof value !== 'object') {
        return;
      }

      Object.entries(value).forEach(([key, entry]) => {
        if (predicate(key, entry)) {
          set(ref(database, `${dayTypePath}/${key}`), null).catch(() => {});
        }
      });
    })
    .catch(() => {});
};

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState(() => ({
    work: sanitizeScheduleList('work', workDaySchedule),
    off: sanitizeScheduleList('off', offDaySchedule),
  }));
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
              work: sanitizeScheduleList('work', workDaySchedule),
              off: sanitizeScheduleList('off', offDaySchedule),
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
        const nextList = list
          .map((item, idx) =>
            idx === index
              ? normalizeScheduleItem(dayType, { ...item, ...updates, id: item.id })
              : item,
          )
          .filter((item) => item.time && item.activity);
        return { ...prev, [dayType]: nextList };
      });
    },
    [setAndPersist],
  );

  const addItem = useCallback(
    (dayType, item) => {
      setAndPersist((prev) => {
        const list = prev[dayType] ?? [];
        const nextItem = normalizeScheduleItem(dayType, item);
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
            ? sanitizeScheduleList('work', workDaySchedule)
            : dayType === 'off'
            ? sanitizeScheduleList('off', offDaySchedule)
            : prev[dayType],
      }));
    },
    [setAndPersist],
  );

  const setSchedule = useCallback(
    (dayType, list) => {
      setAndPersist((prev) => ({
        ...prev,
        [dayType]: sanitizeScheduleList(dayType, list),
      }));
    },
    [setAndPersist],
  );

  const recordScheduleCompletion = useCallback(
    (dateKey, dayType, scheduleItem, dateValue, legacyIndex = null) => {
      if (!dateKey || !dayType || !scheduleItem?.id) {
        return;
      }

      const formattedDate = formatDateForPath(dateKey, dateValue);
      if (!formattedDate) {
        return;
      }

      const normalized = normalizeScheduleItem(dayType, scheduleItem);
      if (!normalized.time || !normalized.activity) {
        return;
      }

      const completionRef = ref(
        database,
        `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}/${normalized.id}`,
      );

      set(completionRef, {
        id: normalized.id,
        time: normalized.time,
        activity: normalized.activity,
        status: true,
        recordedAt: new Date().toISOString(),
      }).catch(() => {});

      if (Number.isInteger(legacyIndex) && legacyIndex >= 0) {
        const legacyRef = ref(
          database,
          `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}/${legacyIndex}`,
        );
        set(legacyRef, null).catch(() => {});
      }

      removeLegacyCompletionEntries(
        formattedDate,
        dayType,
        (key, entry) => {
          if (!entry || key === normalized.id) {
            return false;
          }
          if (entry.id && entry.id === normalized.id) {
            return true;
          }
          if (entry.time && entry.time === normalized.time) {
            return true;
          }
          return false;
        },
      );
    },
    [],
  );

  const clearScheduleCompletion = useCallback(
    (dateKey, dayType, scheduleItem, dateValue, legacyIndex = null) => {
      if (!dateKey || !dayType || !scheduleItem?.id) {
        return;
      }

      const formattedDate = formatDateForPath(dateKey, dateValue);
      if (!formattedDate) {
        return;
      }

      const completionRef = ref(
        database,
        `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}/${scheduleItem.id}`,
      );

      set(completionRef, null).catch(() => {});

      if (Number.isInteger(legacyIndex) && legacyIndex >= 0) {
        const legacyRef = ref(
          database,
          `${FIREBASE_COMPLETION_ROOT}/${formattedDate}/${dayType}/${legacyIndex}`,
        );
        set(legacyRef, null).catch(() => {});
      }

      removeLegacyCompletionEntries(
        formattedDate,
        dayType,
        (key, entry) => {
          if (!entry || key === scheduleItem.id) {
            return false;
          }
          if (entry.id && entry.id === scheduleItem.id) {
            return true;
          }
          if (entry.time && entry.time === scheduleItem.time) {
            return true;
          }
          return false;
        },
      );
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
