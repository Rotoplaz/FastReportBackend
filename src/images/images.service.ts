import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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


}
