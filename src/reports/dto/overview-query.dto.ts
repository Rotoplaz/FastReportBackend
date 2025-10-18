import {IsOptional, IsIn} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class OverviewQueryDto {
    @ApiProperty()
    @IsOptional()
    @IsIn(['last_7_days', 'last_30_days', 'last_3_months', 'year_to_date'])
    range: 'last_7_days' | 'last_30_days' | 'last_3_months' | 'year_to_date' = "last_30_days";
}
