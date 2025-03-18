import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = await this.prisma.category.create({
        data: createCategoryDto,
        include: {
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
      });

      return newCategory;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    
    if (page <= 0) {
      throw new BadRequestException("El parametro page debe ser mayor a 0");
    }

    const numberOfCategories = await this.prisma.category.count();
    const categories = await this.prisma.category.findMany({
      include: {
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
      take: limit,
      skip: limit * (page - 1),
    });

    return {
      limit, 
      page,
      numberOfPages: Math.ceil(numberOfCategories / limit),
      count: numberOfCategories,
      data: categories
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
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
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
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
      });

      return updatedCategory;
    } catch (error) {
      this.handleErrors(error, id);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.category.delete({
        where: { id },
      });

      return { message: `Categoría con ID ${id} eliminada correctamente` };
    } catch (error) {
      this.handleErrors(error, id);
    }
  }

  handleErrors(error: any, id?: string) {
    if (!(error instanceof PrismaClientKnownRequestError)) {
      if (error.message.includes('Argument `data` is missing.')) {
        throw new BadRequestException('El cuerpo de la solicitud no puede estar vacío');
      }
      throw new InternalServerErrorException('Error inesperado');
    }

    switch (error.code) {
      case 'P2002':
        const target = error.meta?.target as string[];

        if (target.includes('name')) {
          throw new ConflictException('El nombre de la categoría ya está en uso');
        } else if (target.includes('supervisorId')) {
          throw new ConflictException('El supervisor ya está asignado a otra categoría');
        }
        break;
      case 'P2025':
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      case 'P2003':
        throw new ConflictException('El supervisor especificado no existe');
      default:
        throw new InternalServerErrorException();
    }
  }
}
