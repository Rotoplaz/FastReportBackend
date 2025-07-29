import { IsOptional, IsIn } from 'class-validator';

export class OverviewQueryDto {
  @IsOptional()
  @IsIn(['last_7_days', 'last_30_days', 'last_3_months', 'year_to_date'])
  range: 'last_7_days' | 'last_30_days' | 'last_3_months' | 'year_to_date' = "last_30_days";
}
