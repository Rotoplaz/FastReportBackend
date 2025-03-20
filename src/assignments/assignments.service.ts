import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssignmentDto: CreateAssignmentDto) {
    const { reportId, workerIds } = createAssignmentDto;

    try {
      const report = await this.prisma.report.findUnique({
        where: { id: reportId }
      });

      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      const workers = await this.prisma.user.findMany({
        where: {
          id: { in: workerIds },
          role: 'worker'
        }
      });

      if (workers.length !== workerIds.length) {
        throw new BadRequestException('Some worker IDs are invalid or not workers');
      }

      const assignments = await this.prisma.asignment.createMany({
        data: workerIds.map(workerId => ({
          reportId,
          workerId
        }))
      });

      return assignments;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error creating assignments');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    
    if (page <= 0) {
      throw new BadRequestException('Page must be greater than 0');
    }

    const totalAssignments = await this.prisma.asignment.count();
    const assignments = await this.prisma.asignment.findMany({
      include: {
        report: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true
          }
        },
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      take: limit,
      skip: limit * (page - 1),
    });

    return {
      limit,
      page,
      numberOfPages: Math.ceil(totalAssignments / limit),
      count: totalAssignments,
      data: assignments
    };
  }

  async findOne(id: string) {
    const assignment = await this.prisma.asignment.findUnique({
      where: { id },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true
          }
        },
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  

  async remove(id: string) {
    try {
      const assignment = await this.prisma.asignment.findUnique({
        where: { id }
      });

      if (!assignment) {
        throw new NotFoundException(`Assignment with ID ${id} not found`);
      }

      await this.prisma.asignment.delete({
        where: { id }
      });

      return { message: 'Assignment deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting assignment');
    }
  }
}
