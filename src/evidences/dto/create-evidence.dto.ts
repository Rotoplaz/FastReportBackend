import { IsNotEmpty, IsUUID } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateEvidenceDto {

    @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  reportId: string;
}