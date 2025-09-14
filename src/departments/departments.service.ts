import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PaginationDto } from "src/common/dto/pagination.dto";

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const newCategory = await this.prisma.department.create({
        data: createDepartmentDto,
        include: {
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        omit: {
          supervisorId: true,
        },
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

    const numberOfCategories = await this.prisma.department.count();
    const categories = await this.prisma.department.findMany({
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      take: limit,
      skip: limit * (page - 1),
      omit: {
        supervisorId: true,
      },
    });

    return {
      limit,
      page,
      numberOfPages: Math.ceil(numberOfCategories / limit),
      count: numberOfCategories,
      data: categories,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.department.findUnique({
      where: { id },
      include: {
        supervisor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    try {
      const updatedCategory = await this.prisma.department.update({
        where: { id },
        data: updateDepartmentDto,
        include: {
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return updatedCategory;
    } catch (error) {
      this.handleErrors(error, id);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.department.delete({
        where: { id },
      });

      return { message: `Categoría con ID ${id} eliminada correctamente` };
    } catch (error) {
      this.handleErrors(error, id);
    }
  }

  handleErrors(error: any, id?: string) {
    if (!(error instanceof PrismaClientKnownRequestError)) {
      if (error.message.includes("Argument `data` is missing.")) {
        throw new BadRequestException(
          "El cuerpo de la solicitud no puede estar vacío"
        );
      }
      throw new InternalServerErrorException("Error inesperado");
    }

    switch (error.code) {
      case "P2002":
        const target = error.meta?.target as string[];

        if (target.includes("name")) {
          throw new ConflictException(
            "El nombre de la categoría ya está en uso"
          );
        } else if (target.includes("supervisorId")) {
          throw new ConflictException(
            "El supervisor ya está asignado a otra categoría"
          );
        }
        break;
      case "P2025":
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      case "P2003":
        throw new ConflictException("El supervisor especificado no existe");
      default:
        throw new InternalServerErrorException();
    }
  }
}
