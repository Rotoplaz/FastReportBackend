import { IsNotEmpty, IsOptional, IsString, IsUUID,  } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  supervisorId?: string;
}