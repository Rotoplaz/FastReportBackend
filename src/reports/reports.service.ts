import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportDto } from "./dto/update-report.dto";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ImagesService } from "src/images/images.service";
import { ReportsGateway } from "./reports.gateway";
import { User } from "@prisma/client";
import { DepartmentsService } from "src/departments/departments.service";
import { dateQueryBuilder } from "./utils/date-query-builder";
import { FindReportsDto } from "./dto/find-report.dto";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imagesService: ImagesService,
    @Inject(forwardRef(() => ReportsGateway))
    private readonly reportsGateway: ReportsGateway,
    private readonly departmentsService: DepartmentsService
  ) {}

  async create(
    createReportDto: CreateReportDto,
    user: User,
    files?: Express.Multer.File[]
  ) {
    try {
      await this.departmentsService.findOne(createReportDto.departmentId);

      const newReport = await this.prisma.report.create({
        data: { ...createReportDto, studentId: user.id  },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (!files) {
        return newReport;
      }

      const images = await this.imagesService.createReportImages(
        newReport.id,
        files
      );

      const reportWithImages = {
        ...newReport,
        images,
      };

      this.reportsGateway.notifyNewReport(reportWithImages);
      return reportWithImages;
    } catch (error) {
      console.log(error);
      this.handleErrors(error);
    }
  }

  async findAll(findReportsDto: FindReportsDto, user: User) {
    const { limit, page, status, ...date } = findReportsDto;

    if (page <= 0) {
      throw new BadRequestException("El parametro page debe ser mayor a 0");
    }

    const dateFilter = dateQueryBuilder(date);

    let departmentFilter = {};
    if (user.role === "supervisor") {
      const supervisorDepartment = await this.prisma.department.findFirst({
        where: { supervisorId: user.id },
      });
      departmentFilter = { departmentId: supervisorDepartment?.id };
    }


    const totalCount = await this.prisma.report.count({
      where: { ...dateFilter, status, ...departmentFilter },
    });

    const reports = await this.prisma.report.findMany({
      where: { ...dateFilter, status, ...departmentFilter },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        images: {
          select: {
            url: true,
            id: true,
          },
        },
      },
      take: limit,
      skip: limit * (page - 1),
    });

    return {
      limit,
      page,
      numberOfPages: Math.ceil(totalCount / limit),
      count: totalCount,
      data: reports,
    };
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            description: true,
            supervisor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        images: {
          select: {
            url: true,
            id: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto, user: any) {
    try {
      const isAdmin = user.role === "admin";

      if (!isAdmin) {
        const report = await this.findOne(id);

        if (report.studentId !== user.id) {
          throw new ForbiddenException(
            "No tienes permiso para actualizar este reporte. Solo el creador del reporte puede actualizarlo."
          );
        }
      }

      const updatedReport = await this.prisma.report.update({
        where: { id },
        data: updateReportDto,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              description: true,
              supervisor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      return updatedReport;
    } catch (error) {
      console.log(error);
      this.handleErrors(error, id);
    }
  }

  async remove(id: string, user: User) {
    try {
      await this.prisma.report.delete({
        where: { id },
      });

      await this.imagesService.deleteFolderWithImages(id, user);

      return { message: `Reporte con ID ${id} eliminado correctamente` };
    } catch (error) {
      this.handleErrors(error, id);
    }
  }

  async getDepartmentMetrics(departmentId: string) {
    try {
      const department = await this.prisma.department.findFirst({where: { id: departmentId } });
      
      const totalReportsPromise = this.prisma.report.count({ where: {departmentId: department?.id} });

      const reportsCompletedPromise = this.prisma.report.count({
        where: { status: "completed", departmentId: department?.id },
      });
      const reportsPendingPromise = this.prisma.report.count({
        where: { status: "pending", departmentId: department?.id },
      });
      const reportsInProgressPromise = this.prisma.report.count({
        where: { status: "in_progress", departmentId: department?.id },
      });
      const highPriorityReportsPromise = this.prisma.report.count({
        where: { priority: "high", departmentId: department?.id },
      });
      const lowPriorityReportsPromise = this.prisma.report.count({
        where: { priority: "low", departmentId: department?.id },
      });
      const mediumPriorityReportsPromise = this.prisma.report.count({
        where: { priority: "medium", departmentId: department?.id },
      });

      const [
        totalReports,
        reportsCompleted,
        reportsPending,
        reportsInProgress,
        highPriorityReports,
        lowPriorityReports,
        mediumPriorityReports,
      ] = await Promise.all([
        totalReportsPromise,
        reportsCompletedPromise,
        reportsPendingPromise,
        reportsInProgressPromise,
        highPriorityReportsPromise,
        lowPriorityReportsPromise,
        mediumPriorityReportsPromise,
      ]);

      return {
        totalReports,
        reportsInProgress,
        reportsPending,
        reportsCompleted,
        highPriorityReports,
        lowPriorityReports,
        mediumPriorityReports,
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);

      throw new BadRequestException();
    }
  }

    async getGlobalMetrics() {
    try {
      const totalReportsPromise = this.prisma.report.count();
      const reportsCompletedPromise = this.prisma.report.count({
        where: { status: "completed", },
      });
      const reportsPendingPromise = this.prisma.report.count({
        where: { status: "pending", },
      });
      const reportsInProgressPromise = this.prisma.report.count({
        where: { status: "in_progress", },
      });
      const highPriorityReportsPromise = this.prisma.report.count({
        where: { priority: "high", },
      });
      const lowPriorityReportsPromise = this.prisma.report.count({
        where: { priority: "low", },
      });
      const mediumPriorityReportsPromise = this.prisma.report.count({
        where: { priority: "medium", },
      });

      const [
        totalReports,
        reportsCompleted,
        reportsPending,
        reportsInProgress,
        highPriorityReports,
        lowPriorityReports,
        mediumPriorityReports,
      ] = await Promise.all([
        totalReportsPromise,
        reportsCompletedPromise,
        reportsPendingPromise,
        reportsInProgressPromise,
        highPriorityReportsPromise,
        lowPriorityReportsPromise,
        mediumPriorityReportsPromise,
      ]);

      return {
        totalReports,
        reportsInProgress,
        reportsPending,
        reportsCompleted,
        highPriorityReports,
        lowPriorityReports,
        mediumPriorityReports,
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);

      throw new BadRequestException();
    }
  }


  handleErrors(error: any, id?: string) {
    if (!(error instanceof PrismaClientKnownRequestError)) {
      if (error.message.includes("Argument `data` is missing.")) {
        throw new BadRequestException(
          "El cuerpo de la solicitud no puede estar vacío"
        );
      }
      throw error;
    }

    switch (error.code) {
      case "P2025":
        throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
      case "P2003":
        const target = error.meta?.target as string;
        if (target.includes("studentId")) {
          throw new ConflictException("El estudiante especificado no existe");
        } else if (target.includes("categoryId")) {
          throw new ConflictException("La categoría especificada no existe");
        }
        break;
      default:
        throw new InternalServerErrorException();
    }
  }
}
