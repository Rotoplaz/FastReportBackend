import { IsUUID, ArrayNotEmpty, ArrayUnique, IsArray } from 'class-validator';

export class RemoveManyDepartmentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ids: string[];
}
