export const formatDuration = (milliseconds) => {
  if (milliseconds == null) {
    return '';
  }

  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const pad = (value) => String(value).padStart(2, '0');

  return `${pad(minutes)}:${pad(seconds)}`;
};

export const formatMinutesToLabel = (minutes) => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
};
