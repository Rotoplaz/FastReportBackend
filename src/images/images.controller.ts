import { Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidatorPipe } from 'src/cloudinary/file-validator/file-validator.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Auth()
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get("/report/:id")
  findAllPhotosReport(@Param('id') id: string) {
    return this.imagesService.findAllImagesReport(id);
  }

  @Post("/report/:id")
  @UseInterceptors(FileInterceptor('image'))
  createReportImage(@Param('id') id: string, @UploadedFile(FileValidatorPipe) image: Express.Multer.File, @GetUser() user: User) {
    return this.imagesService.createImageReport(id, image, user);
  }

  @Delete(':id')
  deleteImage(@Param('id') id: string, @GetUser() user: User) {
    return this.imagesService.deleteImage(id, user);
  }

  @Delete('/folder/:folderName')
  deleteFolderWithImages(@Param('folderName') folderName: string,  @GetUser() user: User) {
    return this.imagesService.deleteFolderWithImages(folderName, user);
  }
}