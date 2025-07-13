import { startOfYear, subDays, subMonths } from "date-fns";

export const getStartDateFromRange = (
  range: "last_7_days" | "last_30_days" | "last_3_months" | "year_to_date"
): Date => {
  const now = new Date();
  switch (range) {
    case "last_7_days":
      return subDays(now, 6);
    case "last_30_days":
      return subDays(now, 30);
    case "last_3_months":
      return subMonths(now, 2);
    case "year_to_date":
    default:
      return startOfYear(now);
  }
};
