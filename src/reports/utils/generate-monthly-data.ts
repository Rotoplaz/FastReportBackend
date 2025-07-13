import { format } from "date-fns";
import { es } from "date-fns/locale";

export const generateMonthlyData = (
  reports: { createdAt: Date }[],
  startDate: Date,
  endDate: Date,
): { name: string; total: number }[] => {
  const monthsMap: Record<string, { name: string; total: number }> = {};

  const cursor = new Date(startDate);
  cursor.setDate(1); 

  while (cursor <= endDate) {
    const key = format(cursor, 'yyyy-MM');
    monthsMap[key] = {
      name: format(cursor, 'MMM', { locale: es }),
      total: 0,
    };
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const report of reports) {
    const createdAt = new Date(report.createdAt);
    const key = format(createdAt, 'yyyy-MM');
    if (monthsMap[key]) {
      monthsMap[key].total += 1;
    }
  }

  return Object.values(monthsMap);
}