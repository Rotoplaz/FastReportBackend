import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { Prisma } from "@prisma/client";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.mapPrismaCodeToStatus(exception.code);
    const message = this.mapPrismaCodeToMessage(exception);

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }

  private mapPrismaCodeToStatus(code: string): number {
    switch (code) {
      case "P2002":
      case "P2003":
        return HttpStatus.CONFLICT;
      case "P2025":
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private mapPrismaCodeToMessage(
    exception: Prisma.PrismaClientKnownRequestError
  ): string {
    const { code, meta } = exception;

    switch (code) {
      case "P2002":
        return `Valor duplicado en el campo único: ${meta?.target}`;
      case "P2003": {
        const fieldName = meta?.field_name;
        if (
          typeof fieldName === "string" &&
          fieldName.includes("Report_departmentId_fkey")
        ) {
          return "No se puede eliminar el o los departamentos porque tiene reportes asociados";
        }
        return "Violación de clave foránea";
      }
      case "P2025":
        return "El recurso no fue encontrado";
      default:
        return "Error inesperado en la base de datos";
    }
  }
}
