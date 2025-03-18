import { Module } from '@nestjs/common';
import { EndpointExmpleModule } from './endpoint-exmple/endpoint-exmple.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EndpointExmpleModule, UsersModule, PrismaModule, CommonModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
