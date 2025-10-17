export const createTaskId = (dateKey) =>
  `${dateKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
