import { UserRole } from "@prisma/client";
import { IsIn, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import {ApiProperty} from "@nestjs/swagger";



export class FindUsersDto extends PaginationDto {

    @ApiProperty()
    @IsOptional()
    @IsIn(["admin","student", "worker", "supervisor"])
    role?: UserRole;

}