import { eachDayOfInterval, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";


export const generateDailyData = (
  reports: { createdAt: Date }[],
  startDate: Date,
  endDate: Date,
): { name: string; total: number }[] =>  {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const data = days.map(day => ({
    name: format(day, 'eee dd/MM', { locale: es }),
    total: 0,
  }));

  for (const report of reports) {
    const createdAt = new Date(report.createdAt);
    const index = days.findIndex(day => isSameDay(day, createdAt));
    if (index !== -1) data[index].total += 1;
  }

  return data;
}

