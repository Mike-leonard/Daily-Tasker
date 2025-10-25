const getIdentifier = (itemOrId) => {
  if (!itemOrId) {
    return '';
  }
  if (typeof itemOrId === 'string') {
    return itemOrId;
  }
  if (typeof itemOrId === 'object') {
    return itemOrId.id ?? itemOrId.time ?? '';
  }
  return String(itemOrId);
};

export const buildScheduleId = (dayType, itemOrId) =>
  `${dayType}::${getIdentifier(itemOrId)}`;

export const buildScheduleTimerId = (dateKey, scheduleId) =>
  `schedule-${dateKey}-${scheduleId}`;

const TIME_RANGE_SEPARATOR = /[-–—]/;

const sanitizeTimeToken = (token) =>
  token
    .split('/')[0]
    .replace(/[^\d:]/g, '')
    .trim();

const parseTimeToMinutes = (token) => {
  const cleaned = sanitizeTimeToken(token);
  if (!cleaned) {
    return Number.NaN;
  }

  const [hoursStr, minutesStr] = cleaned.split(':');
  const hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr ?? '0', 10);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) {
    return Number.NaN;
  }

  if (hours === 24 && minutes === 0) {
    return 24 * 60;
  }

  const normalizedHours = hours % 24;
  return normalizedHours * 60 + minutes;
};

export const extractDurationMinutes = (timeRange) => {
  if (!timeRange) {
    return null;
  }

  const [startRaw, endRaw] = timeRange.split(TIME_RANGE_SEPARATOR).map((part) =>
    part.trim(),
  );

  if (!startRaw || !endRaw) {
    return null;
  }

  const startMinutes = parseTimeToMinutes(startRaw);
  const endMinutes = parseTimeToMinutes(endRaw);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    return null;
  }

  let duration = endMinutes - startMinutes;
  if (duration <= 0) {
    duration += 24 * 60;
  }

  return duration > 0 ? duration : null;
};
