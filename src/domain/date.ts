const displayDatePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseDateInput = (value: string) => {
  const match = displayDatePattern.exec(value);
  if (!match) return null;
  const [, month, day, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day) ? date : null;
};

export const parseIsoDate = (value: string) => {
  const match = isoDatePattern.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day) ? date : null;
};

export const isValidDisplayDate = (value: string) => parseDateInput(value) !== null;
export const isValidIsoDate = (value: string) => parseIsoDate(value) !== null;

export const formatDateInput = (date: Date) => `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;

export const formatIsoDate = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

export const displayToIso = (value: string) => {
  const date = parseDateInput(value);
  return date ? formatIsoDate(date) : "";
};

export const isoToDisplay = (value: string) => {
  const date = parseIsoDate(value);
  return date ? formatDateInput(date) : "";
};

const todayFromLocal = (now: Date) => new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

export const todayInput = (now = new Date()) => formatDateInput(todayFromLocal(now));

export const todayIso = (now = new Date()) => formatIsoDate(todayFromLocal(now));

export const todayInTimezone = (timeZone: string, now = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.month}/${values.day}/${values.year}`;
  } catch {
    return todayInput(now);
  }
};

export const currentSemiMonthlyRange = (now = new Date()) => {
  const local = todayFromLocal(now);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();
  const startDay = day <= 15 ? 1 : 16;
  const endDay = day <= 15 ? 15 : new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return {
    startDate: formatDateInput(new Date(Date.UTC(year, month, startDay))),
    endDate: formatDateInput(new Date(Date.UTC(year, month, endDay)))
  };
};

export const semiMonthlyRangeForDisplay = (value: string) => {
  const date = parseDateInput(value);
  if (!date) return null;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  if (date.getUTCDate() <= 15) return { startDate: formatDateInput(new Date(Date.UTC(year, month, 1))), endDate: formatDateInput(new Date(Date.UTC(year, month, 15))) };
  return { startDate: formatDateInput(new Date(Date.UTC(year, month, 16))), endDate: formatDateInput(new Date(Date.UTC(year, month + 1, 0))) };
};

export const shiftSemiMonthlyRange = (range: { startDate: string; endDate: string }, offset: number) => {
  const start = parseDateInput(range.startDate);
  const end = parseDateInput(range.endDate);
  if (!start || !end) return null;
  const totalHalves = (start.getUTCFullYear() * 12 + start.getUTCMonth()) * 2 + (start.getUTCDate() <= 15 ? 0 : 1) + offset;
  const year = Math.floor(totalHalves / 24);
  const remainder = ((totalHalves % 24) + 24) % 24;
  const month = Math.floor(remainder / 2);
  const secondHalf = remainder % 2 === 1;
  if (secondHalf) return { startDate: formatDateInput(new Date(Date.UTC(year, month, 16))), endDate: formatDateInput(new Date(Date.UTC(year, month + 1, 0))) };
  return { startDate: formatDateInput(new Date(Date.UTC(year, month, 1))), endDate: formatDateInput(new Date(Date.UTC(year, month, 15))) };
};

export const isWeekend = (date: string) => {
  const parsed = parseDateInput(date);
  if (!parsed) return false;
  const day = parsed.getUTCDay();
  return day === 0 || day === 6;
};

export const addDays = (date: string, amount: number) => {
  const parsed = parseDateInput(date);
  if (!parsed) return "";
  const result = new Date(parsed.getTime());
  result.setUTCDate(result.getUTCDate() + amount);
  return formatDateInput(result);
};

export const compareDisplayDates = (left: string, right: string) => {
  const a = parseDateInput(left)?.getTime() ?? 0;
  const b = parseDateInput(right)?.getTime() ?? 0;
  return a - b;
};

const intlDate = (value: string, options: Intl.DateTimeFormatOptions) => {
  const date = parseDateInput(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(date);
};

export const formatLongDate = (value: string, includeWeekday = true) => intlDate(value, includeWeekday ? { weekday: "long", month: "long", day: "numeric", year: "numeric" } : { month: "long", day: "numeric", year: "numeric" });

export const formatMediumDate = (value: string) => intlDate(value, { month: "short", day: "numeric", year: "numeric" });

export const formatMonthDay = (value: string) => intlDate(value, { month: "short", day: "numeric" });

export const formatMonth = (value: string) => intlDate(value, { month: "long" });

export const formatWeekday = (value: string, length: "short" | "long" = "short") => intlDate(value, { weekday: length });

export const formatRangeLabel = (startDate: string, endDate: string) => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (!start || !end) return `${startDate} – ${endDate}`;
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) return `${formatMonthDay(startDate)} – ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  if (sameYear) return `${formatMonthDay(startDate)} – ${formatMonthDay(endDate)}, ${end.getUTCFullYear()}`;
  return `${formatMediumDate(startDate)} – ${formatMediumDate(endDate)}`;
};

export const periodKindLabel = (startDate: string, endDate: string) => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (!start || !end) return "Custom range";
  const isFirstHalf = start.getUTCDate() === 1 && end.getUTCDate() === 15 && start.getUTCMonth() === end.getUTCMonth();
  if (isFirstHalf) return "First half";
  const monthEnd = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  const isSecondHalf = start.getUTCDate() === 16 && end.getUTCDate() === monthEnd && start.getUTCMonth() === end.getUTCMonth();
  return isSecondHalf ? "Second half" : "Custom range";
};

export const daysBetween = (startDate: string, endDate: string) => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (!start || !end) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
};

export const eachDateInRange = (startDate: string, endDate: string) => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  const dates: string[] = [];
  if (!start || !end || start > end) return dates;
  for (let value = new Date(start.getTime()); value <= end; value.setUTCDate(value.getUTCDate() + 1)) dates.push(formatDateInput(value));
  return dates;
};

export const isValidRange = (startDate: string, endDate: string) => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  return Boolean(start && end && start <= end);
};
