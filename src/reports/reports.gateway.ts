import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Report } from "@prisma/client";
import { ReportsService } from "./reports.service";
import { forwardRef, Inject, UseGuards } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { WsAuthGuard } from "src/auth/decorators/ws-auth.guard";
import { WsAuthService } from '../auth/services/ws-auth.service';
@WebSocketGateway({
  cors: {
    methods: ["GET", "POST"],
  },
  namespace: "reports",
})
export class ReportsGateway {
  constructor(
    @Inject(forwardRef(() => ReportsService))
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
    private readonly wsAuthService:WsAuthService
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      await this.wsAuthService.authenticateClient(client);
    } catch (e) {
      console.error("Error en auth WS:", e.message);
      client.emit("error", { type: "auth", message: "Autenticación inválida" });
      client.disconnect();
    }
  }
  
  async notifyNewReport(report: Report) {
    this.server.to("admins").emit("newReport", report);
    this.server.to(`department_${report.departmentId}`).emit("newReport", report);

    await this.notifyReportMetrics();
  }

  async notifyReportUpdate(report: Report) {
    this.server.to("admins").emit("reportUpdate", report);
    this.server
      .to(`department_${report.departmentId}`)
      .emit("reportUpdate", report);

    await this.notifyReportMetrics();
  }

  async notifyReportMetrics() {
    try {
      const globalMetrics = await this.reportsService.getGlobalMetrics();
      this.server.to("admins").emit("metrics", globalMetrics);

      const departments = await this.prisma.department.findMany({
        select: { id: true },
      });

      await Promise.all(
        departments.map(async (dep) => {
          const metrics = await this.reportsService.getDepartmentMetrics(dep.id);
          this.server.to(`department_${dep.id}`).emit("metrics", metrics);
        })
      );
    } catch (error) {
      console.error("Error enviando métricas:", error.message);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage("getInitialRecentReports")
  async sendInitialReports(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    const today = new Date();

    const reports = await this.reportsService.findAll(
      {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
        limit: 100,
        page: 1,
      },
      user
    );

    client.emit("initialRecentReports", reports);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage("getAnnualReports")
  async sendAnnualReports(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    const today = new Date();

    const reports = await this.reportsService.findAll(
      {
        year: today.getFullYear(),
        limit: 100,
        page: 1,
      },
      user
    );

    client.emit("annualReports", reports);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage("getInitialMetrics")
  async sendInitialMetrics() {
    await this.notifyReportMetrics();
  }
}
