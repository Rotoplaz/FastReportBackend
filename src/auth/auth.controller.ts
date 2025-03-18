import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegsiterStudentDto } from './dto/register-student.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('register')
  registerStudent(@Body() regsiterStudentDto: RegsiterStudentDto) {
    return this.authService.registerStudent(regsiterStudentDto)
  }

  
}
