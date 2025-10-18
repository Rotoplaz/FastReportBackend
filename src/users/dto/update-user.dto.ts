
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import {PartialType} from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    @IsUUID()
    departmentId: string;
}
