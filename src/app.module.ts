import { Module } from '@nestjs/common';
import { EndpointExmpleModule } from './endpoint-exmple/endpoint-exmple.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [EndpointExmpleModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
