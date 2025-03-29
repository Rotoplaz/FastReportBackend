import { Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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
  createReportImage(@Param('id') id: string, @UploadedFile(FileValidatorPipe) image: Express.Multer.File) {
    return this.imagesService.createImageReport(id, image);
  }

  @Delete(':id')
  deleteImage(@Param('id') id: string) {
    return this.imagesService.deleteImage(id);
  }

  @Delete('/folder/:folderName')
  deleteFolderWithImages(@Param('folderName') folderName: string) {
    return this.imagesService.deleteFolderWithImages(folderName);
  }
}