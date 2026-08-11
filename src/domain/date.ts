export const parseDateInput = (value: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, month, day, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day) ? date : null;
};

export const formatDateInput = (date: Date) => `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;

export const todayInput = () => formatDateInput(new Date());

export const isWeekend = (date: string) => {
  const parsed = parseDateInput(date);
  if (!parsed) return false;
  const day = parsed.getUTCDay();
  return day === 0 || day === 6;
};
