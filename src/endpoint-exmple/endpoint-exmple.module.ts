import { Module } from '@nestjs/common';
import { EndpointExmpleService } from './endpoint-exmple.service';
import { EndpointExmpleController } from './endpoint-exmple.controller';

@Module({
  controllers: [EndpointExmpleController],
  providers: [EndpointExmpleService],
})
export class EndpointExmpleModule {}
