import {IsOptional, IsInt, Min, Max, IsIn} from 'class-validator';
import {Type} from 'class-transformer';
import {Status} from '@prisma/client';
import {PaginationDto} from 'src/common/dto/pagination.dto';
import {ApiProperty} from "@nestjs/swagger";

export class FindReportsDto extends PaginationDto {

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    year?: number;

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month?: number;

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(31)
    day?: number;

    @ApiProperty()
    @IsOptional()
    @IsIn(["pending", "in_progress", "completed"])
    status?: Status;
}
