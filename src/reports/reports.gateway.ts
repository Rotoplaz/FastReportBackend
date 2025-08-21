import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Report } from "@prisma/client";
import { ReportsService } from "./reports.service";
import { forwardRef, Inject } from "@nestjs/common";
@WebSocketGateway({
  cors: {
    methods: ["GET", "POST"],
  },
  namespace: "reports",
})
export class ReportsGateway {
  constructor(
    @Inject(forwardRef(() => ReportsService))
    private readonly reportsService: ReportsService
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    await this.sendInitialReports(client);
    await this.sendInitialMetrics(client);
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

  @SubscribeMessage("getInitialRecentReports")
  async sendInitialReports(@ConnectedSocket() client: Socket) {
    const today = new Date();
    const reports = await this.reportsService.findAll({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
      limit: 100,
      page: 1,
    });
    client.emit("initialRecentReports", reports);
  }

  @SubscribeMessage("getAnnualReports")
  async sendAnnualReports(@ConnectedSocket() client: Socket) {
    const today = new Date();
    const reports = await this.reportsService.findAll({
      year: today.getFullYear(),
      limit: 100,
      page: 1,
    });
    client.emit("annualReports", reports);
  }

  @SubscribeMessage("getInitialMetrics")
  async sendInitialMetrics(@ConnectedSocket() client: Socket) {
    const metrics = await this.reportsService.getMetrics();
    client.emit("initialMetrics", metrics);
  }
}
