import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DateParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Min(1)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  day?: number;


}