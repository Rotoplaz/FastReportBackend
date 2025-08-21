import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindReportsDto extends PaginationDto {

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  day?: number;

  @IsOptional()
  @IsIn([ "pending", "in_progress", "completed"])
  status?: Status;
}
