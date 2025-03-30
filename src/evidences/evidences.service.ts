import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ReportsService } from 'src/reports/reports.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class EvidencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly reportsService: ReportsService
  ) {}

  async create(createEvidenceDto: CreateEvidenceDto, files?: Express.Multer.File[]) {
    try {
     
      await this.reportsService.findOne(createEvidenceDto.reportId);
      
      const evidence = await this.prisma.evidence.create({
        data: {
          reportId: createEvidenceDto.reportId
        }
      });

    
      if (!files || files.length === 0) {
        return evidence;
      }

      const uploadedImages = await this.cloudinaryService.uploadFiles(files, evidence.id);

      await this.prisma.evidenceImage.createMany({
        data: uploadedImages.map(image => ({
          url: image.secure_url,
          evidenceId: evidence.id
        }))
      });

      const evidenceWithImages = await this.findOne(evidence.id);
      return evidenceWithImages;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    const { limit, page } = pagination;
    
    const numberOfEvidences = await this.prisma.evidence.count();
    const evidences = await this.prisma.evidence.findMany({
      include: {
        report: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        EvidencePhoto: {
          select: {
            id: true,
            url: true
          }
        }
      },
      take: limit,
      skip: limit * (page - 1),
    });

    return {
      limit, 
      page,
      numberOfPages: Math.ceil(numberOfEvidences / limit),
      count: numberOfEvidences,
      data: evidences
    };
  }

  async findOne(id: string) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        EvidencePhoto: {
          select: {
            id: true,
            url: true
          }
        }
      }
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }

    return evidence;
  }



  async remove(id: string) {
    try {
      const evidence = await this.findOne(id);
      
      if (evidence.EvidencePhoto.length > 0) {
        await this.cloudinaryService.deleteFolderWithImages(id);
      }

      await this.prisma.evidence.delete({
        where: { id }
      });

      return { message: 'Evidence deleted successfully' };
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async addImages(id: string, files: Express.Multer.File[]) {
    try {

      await this.findOne(id);

      if (files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      const uploadedImages = await this.cloudinaryService.uploadFiles(files, id);

      await this.prisma.evidenceImage.createMany({
        data: uploadedImages.map(image => ({
          url: image.secure_url,
          evidenceId: id
        }))
      });

      return this.findOne(id);
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async removeImage(imageId: string) {
    try {
      const image = await this.prisma.evidenceImage.findUnique({
        where: { id: imageId }
      });

      if (!image) {
        throw new NotFoundException(`Image with ID ${imageId} not found`);
      }

      const isDeleted = await this.cloudinaryService.deleteImage(image.url);
      
      if (!isDeleted) {
        throw new BadRequestException('Error deleting image from Cloudinary');
      }

      await this.prisma.evidenceImage.delete({
        where: { id: imageId }
      });

      return { message: 'Image deleted successfully' };
    } catch (error) {
      this.handleErrors(error);
    }
  }

  private handleErrors(error: any) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Constraint violation');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Record not found');
      }
    }
    
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    
    console.error(error);
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
