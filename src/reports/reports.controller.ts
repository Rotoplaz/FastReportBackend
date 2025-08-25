import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidatorPipe } from 'src/cloudinary/file-validator/file-validator.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRole } from 'src/users/interfaces/user.interfaces';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { FindReportsDto } from './dto/find-report.dto';

@Auth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  
  @Post()
  @UseInterceptors(FilesInterceptor('images', 3))
  create(@Body() createReportDto: CreateReportDto, @GetUser() user: User, @UploadedFiles(FileValidatorPipe) files?: Express.Multer.File[]) {
    return this.reportsService.create(createReportDto, user, files );
  }

  @Get()
  findAll(@Query() findReportsDto:FindReportsDto, @GetUser() user: User) {
    return this.reportsService.findAll(findReportsDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateReportDto: UpdateReportDto,
    @GetUser() user: User
  ) {
    return this.reportsService.update(id, updateReportDto, user);
  }

  @Auth(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.reportsService.remove(id, user);
  }

}
