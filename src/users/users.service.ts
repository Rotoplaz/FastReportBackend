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

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => UsersGateway))
    private usersGateway: UsersGateway,
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
          department: true,
          workerDepartment: true
        },
        omit: {
          departmentId: true,
          password: true,
        }
      });

      this.usersGateway.notifyNewWorker(newUser, user);

      return newUser;
    } catch (error) {
      this.handleErrors(error);
    }
  }
  async getWorkersByDepartment(departmentId: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    const where = {
      role: UserRole.worker,
      departmentId,
    };

    const workers = await this.prisma.user.findMany({
      where,
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
        department: {
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
        department: true
      },
      omit: { password: true, departmentId: true },
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const {password,...updatedUser} = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return updatedUser;
    } catch (error) {
      this.handleErrors(error, id);
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
