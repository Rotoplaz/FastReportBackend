import { PartialType } from '@nestjs/mapped-types';
import { CreateEndpointExmpleDto } from './create-endpoint-exmple.dto';

export class UpdateEndpointExmpleDto extends PartialType(CreateEndpointExmpleDto) {}
