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
      });

      if (!user) {
        throw new Error("Usuario no encontrado en DB");
      }

      client.data.user = user;

      client.emit("authenticated");


      await this.sendInitialReports(client);
      await this.sendInitialMetrics(client);
    } catch (e) {
      console.error("Error en auth WS:", e.message);
      client.emit("error", { type: "auth", message: "Autenticación inválida" });
      client.disconnect();
    }
  }

  async notifyNewReport(report: Report) {
    this.server.emit("newReport", report);
    await this.notifyReportMetrics();
  }

  async notifyReportUpdate(report: Report) {
    this.server.emit("reportUpdate", report);
    await this.notifyReportMetrics();
  }

  async notifyReportMetrics() {
    const data = await this.reportsService.getMetrics();
    this.server.emit("metrics", data);
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

  @SubscribeMessage("getInitialMetrics")
  async sendInitialMetrics(@ConnectedSocket() client: Socket) {
    const metrics = await this.reportsService.getMetrics();
    client.emit("initialMetrics", metrics);
  }
}
