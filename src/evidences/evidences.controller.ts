import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { EvidencesService } from './evidences.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidatorPipe } from 'src/cloudinary/file-validator/file-validator.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('evidences')
export class EvidencesController {
  constructor(private readonly evidencesService: EvidencesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @Body() createEvidenceDto: CreateEvidenceDto,
    @UploadedFiles(FileValidatorPipe) files?: Express.Multer.File[]
  ) {
    return this.evidencesService.create(createEvidenceDto, files);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.evidencesService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evidencesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evidencesService.remove(id);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 5))
  addImages(
    @Param('id') id: string,
    @UploadedFiles(FileValidatorPipe) files: Express.Multer.File[]
  ) {
    return this.evidencesService.addImages(id, files);
  }

  @Delete('images/:id')
  removeImage(@Param('id') id: string) {
    return this.evidencesService.removeImage(id);
  }
}
