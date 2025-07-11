
interface DateQueryParams {
  year?: number;
  month?: number;
  day?: number;
}

export function dateQueryBuilder({ year, month, day }: DateQueryParams) {
  if (!year) return {}; 

  const from = new Date(year, (month ?? 1) - 1, day ?? 1);
  let to: Date;

  if (year && month && day) {

    to = new Date(year, month - 1, day + 1);

  } else if (year && month) {

    to = new Date(year, month, 1); 

  } else {

    to = new Date(year + 1, 0, 1);
  }

  return {
    createdAt: {
      gte: from,
      lt: to,
    },
  };
}
