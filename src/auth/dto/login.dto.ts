import { IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty()
    @IsString()
    @MinLength(5)
    code: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    password: string;

}