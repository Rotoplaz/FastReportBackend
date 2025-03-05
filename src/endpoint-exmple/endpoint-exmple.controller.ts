import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { EndpointExmpleService } from './endpoint-exmple.service';
import { CreateEndpointExmpleDto } from './dto/create-endpoint-exmple.dto';
import { UpdateEndpointExmpleDto } from './dto/update-endpoint-exmple.dto';

@Controller('endpoint-exmple')
export class EndpointExmpleController {
  constructor(private readonly endpointExmpleService: EndpointExmpleService) {}

  @Post()
  create(@Body() createEndpointExmpleDto: CreateEndpointExmpleDto) {
    return this.endpointExmpleService.create(createEndpointExmpleDto);
  }

  @Get()
  findAll() {
    return this.endpointExmpleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.endpointExmpleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEndpointExmpleDto: UpdateEndpointExmpleDto) {
    return this.endpointExmpleService.update(+id, updateEndpointExmpleDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.endpointExmpleService.remove(+id);
  }
}
