import {IsOptional, IsInt, Min} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiProperty} from "@nestjs/swagger";

export class DateParamsDto {
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
    @Min(1)
    month?: number;

    @ApiProperty()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    day?: number;


}