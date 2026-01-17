import { startOfWeek } from 'date-fns';

export const getWeekStartDate = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

export const formatDateInput = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};
