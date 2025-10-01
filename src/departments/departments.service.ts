import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaginationDto } from "src/common/dto/pagination.dto";

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
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
  }

  async remove(id: string) {
    await this.prisma.department.delete({
      where: { id },
    });

    return { message: `Categoría con ID ${id} eliminada correctamente` };
  }


  async removeMany(ids: string[]) {
    
    const count = await this.prisma.department.count({
      where: { id: { in: ids } },
    });

    if (count !== ids.length) {
      throw new NotFoundException(
        "Alguno(s) de los departamentos no existe(n)."
      );
    }

    const associatedReportsCount = await this.prisma.report.count({
      where: {
        departmentId: {
          in: ids,
        },
      },
    });

    if (associatedReportsCount > 0) {
      throw new ConflictException(
        "No se pueden eliminar porque uno o más departamentos tienen reportes asociados."
      );
    }


    await this.prisma.department.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return { message: `${ids.length} departamento(s) eliminado(s) correctamente.` };
  }

}
