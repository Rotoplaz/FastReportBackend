import { IsInt, IsPositive, IsString } from "class-validator";

export class CreateEndpointExmpleDto {

  @IsString({message: "El nombre debe de ser un string."})
  name: string;
  @IsInt({message: "La edad debe de ser un numero entero."})
  @IsPositive({message: "La edad debe de ser un numero positivo."})
  age: number;
}
