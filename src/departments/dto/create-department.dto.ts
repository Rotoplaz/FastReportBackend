import {IsNotEmpty, IsOptional, IsString, IsUUID,} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateDepartmentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsString()
    @IsUUID()
    @IsOptional()
    supervisorId?: string;
}