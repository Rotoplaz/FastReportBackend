import { Module } from '@nestjs/common';
import { EndpointExmpleModule } from './endpoint-exmple/endpoint-exmple.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [EndpointExmpleModule, UsersModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
