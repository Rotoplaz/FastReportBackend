import { Module } from '@nestjs/common';
import { EndpointExmpleModule } from './endpoint-exmple/endpoint-exmple.module';

@Module({
  imports: [EndpointExmpleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
