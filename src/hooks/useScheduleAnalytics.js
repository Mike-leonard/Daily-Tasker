import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';

import { database } from '../lib/firebase';
import { FIREBASE_COMPLETION_ROOT } from '../constants/firebasePaths';
import { extractDurationMinutes } from '../utils/schedule';

const toMonthKey = (isoString) => {
  if (!isoString) {
    return null;
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = date.getMonth();
  return {
    key: `${year}-${String(month + 1).padStart(2, '0')}`,
    label: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
  };
};

const parseLegacyDateKey = (rawKey) => {
  if (!rawKey) {
    return null;
  }

  const match = rawKey.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)(\d{1,2})_(\d{4})$/,
  );
  if (!match) {
    return null;
  }
  const [, monthName, day, year] = match;
  const date = new Date(`${monthName} ${day}, ${year}`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const deriveMonthInfo = (dayKey, record) => {
  if (record?.recordedAt) {
    const fromRecorded = toMonthKey(record.recordedAt);
    if (fromRecorded) {
      return fromRecorded;
    }
  }
  const parsed = parseLegacyDateKey(dayKey);
  if (parsed) {
    return {
      key: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`,
      label: parsed.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    };
  }
  return null;
};

const minutesToHours = (minutes) => minutes / 60;

export const useScheduleAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    months: [],
    totalsByMonth: {},
  });
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    const completionsRef = ref(database, FIREBASE_COMPLETION_ROOT);
    setStatus('loading');

    const unsubscribe = onValue(
      completionsRef,
      (snapshot) => {
        const value = snapshot.val();
        if (!value || typeof value !== 'object') {
          setAnalytics({ months: [], totalsByMonth: {} });
          setStatus('ready');
          return;
        }

        const totals = {};

        Object.entries(value).forEach(([dayKey, dayValue]) => {
          if (!dayValue || typeof dayValue !== 'object') {
            return;
          }

          Object.entries(dayValue).forEach(([dayType, entries]) => {
            if (!entries || typeof entries !== 'object') {
              return;
            }

            Object.entries(entries).forEach(([entryKey, entry]) => {
              if (!entry || entry.status !== true) {
                return;
              }

              const monthInfo = deriveMonthInfo(dayKey, entry);
              if (!monthInfo) {
                return;
              }

              const durationMinutes = extractDurationMinutes(entry.time);
              if (!durationMinutes) {
                return;
              }

              const activity = entry.activity || 'Unnamed block';
              const taskKey = `${dayType}::${entry.id ?? entryKey}::${activity}`;

              if (!totals[monthInfo.key]) {
                totals[monthInfo.key] = {
                  key: monthInfo.key,
                  label: monthInfo.label,
                  totalMinutes: 0,
                  tasks: {},
                };
              }

              const monthBucket = totals[monthInfo.key];
              monthBucket.totalMinutes += durationMinutes;

              if (!monthBucket.tasks[taskKey]) {
                monthBucket.tasks[taskKey] = {
                  activity,
                  dayType,
                  minutes: 0,
                  occurrences: 0,
                };
              }

              const taskBucket = monthBucket.tasks[taskKey];
              taskBucket.minutes += durationMinutes;
              taskBucket.occurrences += 1;
            });
          });
        });

        const months = Object.values(totals)
          .sort((a, b) => (a.key < b.key ? 1 : -1))
          .map((month) => ({
            key: month.key,
            label: month.label,
            totalHours: minutesToHours(month.totalMinutes),
            tasks: Object.values(month.tasks)
              .sort((a, b) => b.minutes - a.minutes)
              .map((task) => ({
                activity: task.activity,
                dayType: task.dayType,
                hours: minutesToHours(task.minutes),
                occurrences: task.occurrences,
              })),
          }));

        setAnalytics({
          months,
          totalsByMonth: totals,
        });
        setStatus('ready');
      },
      () => {
        setStatus('error');
      },
    );

    return () => unsubscribe();
  }, []);

  const hasData = useMemo(
    () => analytics.months.some((month) => month.tasks.length > 0),
    [analytics.months],
  );

  return {
    status,
    analytics,
    hasData,
  };
};
