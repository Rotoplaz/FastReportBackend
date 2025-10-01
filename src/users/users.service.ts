import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FindUsersDto } from "./dto/find-users.dto";
import { User, UserRole } from "@prisma/client";
import { PaginationDto } from "../common/dto/pagination.dto";
import { UsersGateway } from "./users.gateway";
import { UpdateUserRoleDto } from "./dto/update-user-role";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UsersGateway))
    private usersGateway: UsersGateway
  ) {}

  async create(createUserDto: CreateUserDto, user: User) {
    const hashPasword = bcrypt.hashSync(createUserDto.password, 10);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashPasword,
        },
        include: {
          supervisesDepartment: true,
          workerDepartment: true,
        },
        omit: {
          workerDepartmentId: true,
          password: true,
        },
      });

      const department = await this.prisma.department.findUnique({
        where: { supervisorId: user.id },
        select: { id: true },
      });

      this.usersGateway.notifyNewWorker(newUser, department?.id || "");

      return newUser;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findWorker(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        code: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        workerDepartment: true,
        supervisesDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async getWorkersByDepartment(
    departmentId: string,
    paginationDto: PaginationDto
  ) {
    const { limit = 10, page = 1 } = paginationDto;

    const where = {
      role: UserRole.worker,
    };

    const workers = await this.prisma.user.findMany({
      where: { ...where, workerDepartmentId: departmentId },
      take: limit,
      skip: limit * (page - 1),
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        code: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        workerDepartment: true,
        supervisesDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const workersCount = await this.prisma.user.count({ where });

    return {
      limit,
      page,
      numberOfPages: Math.ceil(workersCount / limit),
      count: workersCount,
      data: workers,
    };
  }

  async findAll(findUsersDto: FindUsersDto, user: User) {
    const { limit = 10, page = 0 } = findUsersDto;

    if (user.role !== UserRole.admin) {
      return new ForbiddenException("Auth error");
    }

    const where = {
      role: {
        in: [UserRole.supervisor, UserRole.worker],
      },
    };

    const users = await this.prisma.user.findMany({
      where: { ...where },
      include: {
        workerDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
        supervisesDepartment: true,
      },
      omit: { password: true, workerDepartmentId: true },
      take: limit,
      skip: limit * (page - 1),
    });

    const usersCount = await this.prisma.user.count({
      where,
    });

    return {
      limit,
      page,
      numberOfPages: Math.ceil(usersCount / limit),
      count: usersCount,
      data: users,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: User) {
    const { departmentId, ...data } = updateUserDto;
    try {
      const oldUser = await this.findWorker(id);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { ...data, workerDepartmentId: departmentId },
        include: {
          supervisesDepartment: true,
          workerDepartment: true,
        },
        omit: {
          workerDepartmentId: true,
          password: true,
        },
      });

      const oldDepartmentId = oldUser.workerDepartment?.id || "";
      const newDepartmentId = updatedUser.workerDepartment?.id || "";

      this.usersGateway.notifyOnUpdateWorker(updatedUser, [
        oldDepartmentId,
        newDepartmentId,
      ]);

      return updatedUser;
    } catch (error) {
      console.log(error);
      this.handleErrors(error, id);
    }
  }

  async updateUserRole(id: string, { role }: UpdateUserRoleDto, user: User) {
    if (user.role !== UserRole.admin) {
      throw new ForbiddenException(
        "No tienes permisos para cambiar roles de usuario."
      );
    }

    try {
      const userToUpdate = await this.prisma.user.findUnique({
        where: { id },
        include: {
          supervisesDepartment: true,
        },
      });

      if (!userToUpdate) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      if (userToUpdate.supervisesDepartment) {
        await this.prisma.department.update({
          where: { id: userToUpdate.supervisesDepartment.id },
          data: { supervisorId: null },
        });
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          role,
          workerDepartmentId: null,
        },
        omit: { password: true },
      });


      this.usersGateway.notifyOnUpdateWorker(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return { message: `Usuario con ID ${id} eliminado correctamente` };
    } catch (error) {
      this.handleErrors(error, id);
    }
  }

  async removeMany(ids: string[], user: User) {
    try {
      const department = await this.prisma.department.findFirst({
        where: { supervisorId: user.id },
      });
      const workers = await this.prisma.user.findMany({
        where: {
          id: { in: ids },
        },
      });

      const deletePromises = workers.map((worker) =>
        this.prisma.user.delete({ where: { id: worker.id } })
      );

      await this.prisma.$transaction([...deletePromises]);
      this.usersGateway.notifyOnDeleteWorkers(ids, department?.id || "");
      return {
        message: `${workers.length} trabajadores eliminados correctamente.`,
      };
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  async getUnassignedWorkersAndSupervisors() {
    try {
      const workers = await this.prisma.user.findMany({
        where: {
          role: { in: ["worker", "supervisor"] },
          workerDepartmentId: null,
          supervisesDepartment: null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          code: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          workerDepartment: true,
          supervisesDepartment: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return workers;
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  handleErrors(error: any, id?: string) {
    if (!(error instanceof PrismaClientKnownRequestError)) {
      if (error.message.includes("Argument `data` is missing.")) {
        throw new BadRequestException(
          "El cuerpo de la solicitud no puede estar vacío"
        );
      }
    }

    switch (error.code) {
      case "P2002":
        const target = error.meta?.target as string[];

        if (target.includes("code")) {
          throw new ConflictException("El código ya está en uso");
        } else if (target.includes("email")) {
          throw new ConflictException("El correo electrónico ya está en uso");
        }
      case "P2025":
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

      default:
        throw new InternalServerErrorException();
    }
  }
}
