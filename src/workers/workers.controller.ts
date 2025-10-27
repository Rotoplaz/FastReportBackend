import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}


  @Get('/department/:departmentId')
  getWorkersByDepartmentId(@Param('departmentId') departmentId: string) {
    return this.workersService.getWorkersByDepartmentId(departmentId);
  }


}
