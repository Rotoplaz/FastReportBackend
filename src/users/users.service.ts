import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { FindUsersDto } from "./dto/find-users.dto";
import { User, UserRole } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashPasword = bcrypt.hashSync(createUserDto.password, 10);
    try {
      const { password, ...newUser } = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashPasword,
        },
      });

      return newUser;
    } catch (error) {
      this.handleErrors(error);
    }
  }

  async findAll(findUsersDto: FindUsersDto, user: User) {
    const { limit = 10, page = 0 } = findUsersDto;

    let where = {};

    if (user.role === UserRole.admin) {
      where = {
        role: {
          in: [UserRole.supervisor, UserRole.worker],
        },
      };
    } else if (user.role === UserRole.supervisor) {
     
      where = { role: UserRole.worker };
    } else {
      throw new ForbiddenException("No tienes permisos para ver usuarios");
    }

    const users = await this.prisma.user.findMany({
      where,
      take: limit,
      skip: limit * (page - 1),
    });

    const usersCount = await this.prisma.user.count({
      where
    })

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
      const updatedUser = await this.prisma.user.update({
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
