import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Priority, Status } from '@prisma/client';

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Priority)
  @IsNotEmpty()
  priority: Priority;

  @IsEnum(Status)
  @IsNotEmpty()
  status: Status;

  @IsString()
  @IsNotEmpty()
  location: string;
}