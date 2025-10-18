import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_RATE_MS = 1000;

const createRunningTimer = (durationMinutes, meta = {}) => {
  const durationMs = durationMinutes * 60 * 1000;
  return {
    durationMs,
    remainingMs: durationMs,
    startedAt: Date.now(),
    isRunning: true,
    completed: false,
    meta,
  };
};

const recalcTimer = (timer) => {
  if (!timer.isRunning) {
    return timer;
  }

  const elapsed = Date.now() - timer.startedAt;
  const remainingMs = Math.max(timer.durationMs - elapsed, 0);

  if (remainingMs <= 0) {
    return {
      ...timer,
      remainingMs: 0,
      isRunning: false,
      completed: true,
    };
  }

  if (remainingMs === timer.remainingMs) {
    return timer;
  }

  return {
    ...timer,
    remainingMs,
  };
};

export const useTaskTimers = (onTimerComplete) => {
  const [timers, setTimers] = useState({});
  const completionCallbackRef = useRef(onTimerComplete);
  const timersRef = useRef(timers);

  useEffect(() => {
    completionCallbackRef.current = onTimerComplete;
  }, [onTimerComplete]);

  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        let mutated = false;
        const next = {};

        Object.entries(prev).forEach(([taskId, timer]) => {
          const updated = recalcTimer(timer);
          const hasChanged = updated !== timer;

          if (updated.completed) {
            mutated = true;
            if (!timer.completed) {
              completionCallbackRef.current?.(taskId, updated.meta);
            }
            return;
          }

          next[taskId] = updated;

          if (hasChanged) {
            mutated = true;
          }
        });

        return mutated ? next : prev;
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  const startTimer = useCallback((taskId, durationMinutes, meta) => {
    const hasRunningTimer = Object.values(timersRef.current).some(
      (timer) => timer.isRunning,
    );

    if (hasRunningTimer) {
      return false;
    }

    const timer = createRunningTimer(durationMinutes, meta);
    timersRef.current = {
      ...timersRef.current,
      [taskId]: timer,
    };

    setTimers((prev) => ({
      ...prev,
      [taskId]: timer,
    }));

    return true;
  }, []);

  const clearTimer = useCallback((taskId) => {
    if (!timersRef.current[taskId]) {
      return;
    }

    const { [taskId]: _removed, ...rest } = timersRef.current;
    timersRef.current = rest;
    setTimers(rest);
  }, []);

  const stopTimer = useCallback((taskId) => {
    const timer = timersRef.current[taskId];
    if (!timer) {
      return;
    }

    const updated = {
      ...timer,
      isRunning: false,
    };

    timersRef.current = {
      ...timersRef.current,
      [taskId]: updated,
    };

    setTimers((prev) => ({
      ...prev,
      [taskId]: updated,
    }));
  }, []);

  const timerForTask = useCallback(
    (taskId) => timers[taskId],
    [timers],
  );

  return {
    timers,
    startTimer,
    stopTimer,
    clearTimer,
    timerForTask,
  };
};
