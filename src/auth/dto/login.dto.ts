import { IsString, MinLength } from "class-validator";

export class LoginDto {

    @IsString()
    @MinLength(5)
    code: string;
    
    @IsString()
    @MinLength(5)
    password: string;

}