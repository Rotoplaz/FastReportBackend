import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<any> {
    const { code, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { code },
    });

    if (!user) {
      throw new BadRequestException("Contraseña o usuario no valido.");
    }

    const { password: userPassword, ...rest } = user;
    const match = bcrypt.compareSync(password, user.password);

    if (match) {
      return {
        ...rest,
        jwt: this.jwtService.sign({ id: rest.id }),
      };
    }

    throw new BadRequestException("Contraseña o usuario no valido.");
  }
}
