import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from '@prisma/client';

@Injectable()
export class ImagesService {

  constructor(private readonly prisma: PrismaService, private readonly cloudinaryService: CloudinaryService) {}

  async createReportPhotos(reportId: string, files: Express.Multer.File[]) {
    try {
      
      if(files instanceof Array && files.length === 0) {
        throw new BadRequestException('El arreglo de archivos no puede estar vacío')
      }
      const uploadedImages =  await this.cloudinaryService.uploadFiles(files, reportId);
   
      await this.prisma.reportPhoto.createMany({
        data: uploadedImages.map(image => {
          return {
            url: image.secure_url,
            reportId: reportId
          }
        }),
      });

      const images = await this.findAllPhotosReport(reportId)

      return images;

    } catch (error) {
      
      return []
    }

  }

  async findAllPhotosReport(id: string) {

    const reportPhotos = await this.prisma.reportPhoto.findMany({
      where: {
        reportId: id
      },
      select: {
        url: true,
        id: true
      }
    })
    
    return reportPhotos;
  }

  async createImageReport(id: string, image: Express.Multer.File, user: User) {

    const report = await this.prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      throw new BadRequestException('El reporte no existe');
    }

    if(user.id !== report.studentId) {
      throw new BadRequestException('No tienes permisos para crear esta imagen' );
    }

    try {
      const uploadedImage = await this.cloudinaryService.uploadFile(image, id);
      const newReportImage = await this.prisma.reportPhoto.create({
        data: {
          url: uploadedImage.secure_url,
          reportId: id
        },
        select: {
          url: true,
          id: true
        }
      })
  
      return newReportImage;
      
    } catch (error) {
      throw new BadRequestException('Error al crear la imagen');
    }
  }

  async deleteImage(id: string, user: User) {

    const report = await this.prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      throw new BadRequestException('El reporte no existe');
    }

    if(user.id !== report.studentId) {
      throw new BadRequestException('No tienes permisos para eliminar esta imagen' );
    }
    

    try {
      const image = await this.prisma.reportPhoto.findUnique({
        where: { id }
      });

      if (!image) {
        throw new BadRequestException('La imagen no existe');
      }

      const isDeleted = await this.cloudinaryService.deleteImage(image.url);
      
      if (!isDeleted) {
        throw new BadRequestException('Error al eliminar la imagen de Cloudinary');
      }

      await this.prisma.reportPhoto.delete({
        where: { id }
      });

      return { message: 'Imagen eliminada correctamente' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la imagen');
    }
  }

  async deleteFolderWithImages(folderName: string, user: User) {

    const report = await this.prisma.report.findUnique({
      where: { id: folderName }
    });

    if (!report) {
      throw new BadRequestException('El reporte no existe');
    }

    if(user.role !== 'admin') {
      throw new BadRequestException('No tienes permisos para borrar la carpeta' );
    }
    

    return this.cloudinaryService.deleteFolderWithImages(folderName); 
  }

}
