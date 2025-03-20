import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  reportId: string;

  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  workerIds: string[];
}