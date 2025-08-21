import { UserRole } from "@prisma/client";
import { IsIn, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";



export class FindUsersDto extends PaginationDto {

    @IsOptional()
    @IsIn(["admin","student", "worker", "supervisor"])
    role?: UserRole;

}