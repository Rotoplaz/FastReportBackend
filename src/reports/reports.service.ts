import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ImagesService } from 'src/images/images.service';
import { User } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService, private readonly imagesService: ImagesService) {}

  async create(createReportDto: CreateReportDto, files?: Express.Multer.File[]) {
    try {
      const newReport = await this.prisma.report.create({
        data: createReportDto,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            }
          }
        }
      });

      if (!files) {
        return newReport;
      }

      const images = await this.imagesService.createReportPhotos(newReport.id, files);

      return { 
        ...newReport,
        images
      };
    } catch (error) {
      console.log(error)
      this.handleErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    
    if (page <= 0) {
      throw new BadRequestException("El parametro page debe ser mayor a 0");
    }

    const numberOfReports = await this.prisma.report.count();
    const reports = await this.prisma.report.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        photos: { 
          select: {
            url: true,
            id: true,
          }
         }
      },
      take: limit,
      skip: limit * (page - 1),
    });

    return {
      limit, 
      page,
      numberOfPages: Math.ceil(numberOfReports / limit),
      count: numberOfReports,
      data: reports
    };
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            supervisor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          },
          
        },
        photos: { 
          select: {
            url: true,
            id: true,
          }
         }
      }
    });

    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto, user: any) {
    try {
      const isAdmin = user.role === 'admin';
      
      if (!isAdmin) {
        const report = await this.findOne(id);
        
        if (!report) {
          throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
        }
        
        if (report.studentId !== user.id) {
          throw new ForbiddenException('No tienes permiso para actualizar este reporte. Solo el creador del reporte puede actualizarlo.');
        }
      }
      
      const updatedReport = await this.prisma.report.update({
        where: { id },
        data: updateReportDto,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              supervisor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        }
      });

      return updatedReport;
    } catch (error) {
      console.log(error)
      this.handleErrors(error, id);
    }
  }

  async remove(id: string, user: User) {
    try {
      await this.prisma.report.delete({
        where: { id },
      });

      await this.imagesService.deleteFolderWithImages(id, user);

      return { message: `Reporte con ID ${id} eliminado correctamente` };
    } catch (error) {
      this.handleErrors(error, id);
    }
  }

  handleErrors(error: any, id?: string) {
    if (!(error instanceof PrismaClientKnownRequestError)) {
      if (error.message.includes('Argument `data` is missing.')) {
        throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
      }
      throw error;
    }

    switch (error.code) {
      case 'P2025':
        throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
      case 'P2003':
        const target = error.meta?.target as string;
        if (target.includes('studentId')) {
          throw new ConflictException('El estudiante especificado no existe');
        } else if (target.includes('categoryId')) {
          throw new ConflictException('La categoría especificada no existe');
        }
        break;
      default:
        throw new InternalServerErrorException();
    }
  }
}
