import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login.dto";
import { RegsiterStudentDto } from './dto/register-student.dto';

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
      include: { supervisesDepartment: true } 
    });

    if (!user) {
      throw new BadRequestException("Contraseña o usuario no valido.");
    }

    const { password: userPassword, ...rest } = user;
    const match = bcrypt.compareSync(password, user.password);

    if (match) {
      return {
        user: {...rest},
        jwt: this.jwtService.sign({ id: rest.id }),
      };
    }

    throw new BadRequestException("Contraseña o usuario no valido.");
  }

  async registerStudent(regsiterStudentDto : RegsiterStudentDto){
    const newStudent = await this.prisma.user.create({
      data: {
        ...regsiterStudentDto,
        role: "student"
      }
    });

    return {
      user: newStudent,
      jwt: this.jwtService.sign({ id: newStudent.id })
    };
  }
}
