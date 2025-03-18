import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './role-protected.decorator';
import { UserRole } from 'src/users/interfaces/user.interfaces';
import { UserRoleGuard } from '../guards/user-role.guard';


export function Auth(...roles: UserRole[]) {

  return applyDecorators(
    RoleProtected(roles),
    UseGuards( AuthGuard('jwt'), UserRoleGuard ),
  );

}