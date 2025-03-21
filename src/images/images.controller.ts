import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidatorPipe } from 'src/cloudinary/file-validator/file-validator.pipe';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get("/report/:id")
  findAllPhotosReport(@Param('id') id: string) {
    return this.imagesService.findAllPhotosReport(id);
  }

  @Post("/report/:id")
  @UseInterceptors(FileInterceptor('image'))
  createReportImage(@Param('id') id: string, @UploadedFile(FileValidatorPipe) file: Express.Multer.File) {
    return this.imagesService.createImageReport(id, file);
  }

}