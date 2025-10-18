import {IsArray, IsNotEmpty, IsString, IsUUID} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateAssignmentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    reportId: string;

    @ApiProperty()
    @IsArray()
    @IsString({each: true})
    @IsUUID('4', {each: true})
    workerIds: string[];
}