import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEvidenceDto {
  @IsUUID()
  @IsNotEmpty()
  reportId: string;
}