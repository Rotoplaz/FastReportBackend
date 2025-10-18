import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserRoleDto  {
    @IsString({ message: 'El rol debe ser una cadena de texto.' })
    @IsEnum(UserRole, { message: 'El rol debe ser uno de los siguientes valores: admin, student, worker, supervisor.' })
    role: UserRole;
}
