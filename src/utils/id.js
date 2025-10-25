export const createScheduleItemId = (dayType = 'sched') =>
  `${dayType}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
