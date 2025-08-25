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
import { JwtService } from "@nestjs/jwt";
import { WsAuthGuard } from "src/auth/decorators/ws-auth.guard";
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
    private readonly jwtService: JwtService
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const raw =
        client.handshake.auth?.token || client.handshake.headers?.authorization;

      if (!raw) throw new Error("Token ausente");

      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
      const payload = this.jwtService.verify<{ id: string }>(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        include: { Category: true },
      });

      if (!user) throw new Error("Usuario no encontrado en DB");

      client.data.user = user;
      client.emit("authenticated");

      if (user.role === "supervisor" && user.Category) {
        client.join(`category_${user.Category.id}`);
      } else if (user.role === "admin") {
        client.join("admins");
      }

    } catch (e) {
      console.error("Error en auth WS:", e.message);
      client.emit("error", { type: "auth", message: "Autenticación inválida" });
      client.disconnect();
    }
  }
  async notifyNewReport(report: Report) {
    this.server.to("admins").emit("newReport", report);
    this.server.to(`category_${report.categoryId}`).emit("newReport", report);

    await this.notifyReportMetrics();
  }

  async notifyReportUpdate(report: Report) {
    this.server.to("admins").emit("reportUpdate", report);
    this.server
      .to(`category_${report.categoryId}`)
      .emit("reportUpdate", report);

    await this.notifyReportMetrics();
  }

  async notifyReportMetrics() {
    try {
      const globalMetrics = await this.reportsService.getGlobalMetrics();
      this.server.to("admins").emit("metrics", globalMetrics);

      const categories = await this.prisma.category.findMany({
        select: { id: true },
      });
      for (const cat of categories) {
        const metrics = await this.reportsService.getCategoryMetrics(cat.id);
        this.server.to(`category_${cat.id}`).emit("metrics", metrics);
      }
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
