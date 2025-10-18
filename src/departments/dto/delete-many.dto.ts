import {IsUUID, ArrayNotEmpty, ArrayUnique, IsArray} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class RemoveManyDepartmentsDto {
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsUUID('all', {each: true})
    ids: string[];
}
