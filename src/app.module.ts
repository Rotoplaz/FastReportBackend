import { Module } from '@nestjs/common';
import { EndpointExmpleModule } from './endpoint-exmple/endpoint-exmple.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [EndpointExmpleModule, UsersModule, PrismaModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
