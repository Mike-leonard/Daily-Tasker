const toSafeDate = (dateLike) => {
  if (dateLike instanceof Date) {
    return new Date(dateLike.getTime());
  }

  return new Date(dateLike ?? Date.now());
};

export const normalizeDate = (dateLike) => {
  const next = toSafeDate(dateLike);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const addDays = (dateLike, days) => {
  const next = normalizeDate(dateLike);
  next.setDate(next.getDate() + days);
  return next;
};

export const dateKeyFromDate = (dateLike) =>
  normalizeDate(dateLike).toISOString().split('T')[0];

export const createDateEntry = (baseDate, offset = 0) => {
  const date = addDays(baseDate, offset);
  return { key: dateKeyFromDate(date), date };
};

export const generateDates = (startDate = new Date(), count = 7) => {
  const base = normalizeDate(startDate);
  return Array.from({ length: count }, (_, index) =>
    createDateEntry(base, index),
  );
};

export const formatLongDate = (dateLike) =>
  normalizeDate(dateLike).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

export const formatWeekday = (dateLike) =>
  normalizeDate(dateLike).toLocaleDateString(undefined, {
    weekday: 'long',
  });

export const formatBadgeLabel = (dateLike) =>
  normalizeDate(dateLike).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
