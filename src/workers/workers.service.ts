import { Injectable } from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class WorkersService {

    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

  async getWorkersByDepartmentId(departmentId: string) {
        const workers = await this.prismaService.user.findMany({
            where: { workerDepartmentId: departmentId },
        });
        return {
            data: workers,
        };
  }

}
