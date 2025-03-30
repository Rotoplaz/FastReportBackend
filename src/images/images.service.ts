import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User } from '@prisma/client';
import { ReportsService } from 'src/reports/reports.service';

@Injectable()
export class ImagesService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => ReportsService))
    private reportsService: ReportsService,
  ) {}

  async createReportPhotos(reportId: string, files: Express.Multer.File[]) {
    try {

      if(files instanceof Array && files.length === 0) {
        throw new BadRequestException('El arreglo de archivos no puede estar vacío')
      }
      const uploadedImages =  await this.cloudinaryService.uploadFiles(files, reportId);
   
      await this.prismaService.reportPhoto.createMany({
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

    const reportPhotos = await this.prismaService.reportPhoto.findMany({
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

    const report = await this.reportsService.findOne(id);

    if(user.id !== report.studentId) {
      throw new BadRequestException('No tienes permisos para crear esta imagen' );
    }

    try {
      const uploadedImage = await this.cloudinaryService.uploadFile(image, id);
      const newReportImage = await this.prismaService.reportPhoto.create({
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
    try {
      const image = await this.prismaService.reportPhoto.findUnique({
        where: { id },
        include: { report: { select: { studentId: true } } }
      });

      if (!image) {
        throw new BadRequestException('La imagen no existe');
      }
      if (user.role !== 'admin' && user.id !== image.report.studentId) {
        throw new BadRequestException('No tienes permisos para eliminar esta imagen');
      }

      const [isDeleted] = await Promise.all([
        this.cloudinaryService.deleteImage(image.url),
        this.prismaService.reportPhoto.delete({ where: { id } })
      ]);
      
      if (!isDeleted) {
        throw new BadRequestException('La imagen se eliminó de la base de datos pero hubo un error al eliminarla de Cloudinary');
      }

      return { message: 'Imagen eliminada correctamente' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la imagen');
    }
  }

  async deleteFolderWithImages(folderName: string, user: User) {
    
    if(user.role !== 'admin') {
      const report = await this.reportsService.findOne(folderName);

      if(user.id!== report.studentId) {
        throw new BadRequestException('No tienes permisos para eliminar esta carpeta' );
      }

    }

    return this.cloudinaryService.deleteFolderWithImages(folderName); 
  }

}
