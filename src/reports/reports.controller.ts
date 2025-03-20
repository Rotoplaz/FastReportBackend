import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  create(@Body() createReportDto: CreateReportDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.reportsService.create(createReportDto, files);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.reportsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
