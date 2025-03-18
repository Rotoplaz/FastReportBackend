import { IsEmail, IsString, MinLength } from "class-validator";

export class RegsiterStudentDto {

    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
    firstName: string;

    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres.' })
    lastName: string;

    @IsString({ message: 'El correo electrónico debe ser una cadena de texto.' })
    @MinLength(3, { message: 'El correo electrónico debe tener al menos 3 caracteres.' })
    @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
    email: string;

    @IsString({ message: 'El código debe ser una cadena de texto.' })
    @MinLength(5, { message: 'El código debe tener al menos 5 caracteres.' })
    code: string;

    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    password: string;
}