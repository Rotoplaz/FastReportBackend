import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new InternalServerErrorException('Usuario no encontrado (request)');
    }

    return data ? user[data] : user;
  },
);