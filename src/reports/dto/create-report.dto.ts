import {IsEnum, IsNotEmpty, IsString, IsUUID} from 'class-validator';
import {Priority, Status} from '@prisma/client';
import {ApiProperty} from "@nestjs/swagger";

export class CreateReportDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    departmentId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsEnum(Priority)
    @IsNotEmpty()
    priority: Priority;

    @ApiProperty()
    @IsEnum(Status)
    @IsNotEmpty()
    status: Status;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    location: string;
}