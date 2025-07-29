import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Report } from "@prisma/client";
import { ReportsService } from "./reports.service";
import { forwardRef, Inject } from "@nestjs/common";
@WebSocketGateway({
  cors: true,
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

    this.handleGetInitialReports(client);
    this.handleGetInitialMetrics(client);

  }

  notifyNewReport(report: Report) {
    this.server.emit("newReport", report);
    this.notifyReportMetricts();
  }

  notifyReportUpdate(report: Report) {
    this.server.emit("reportUpdate", report);
    this.notifyReportMetricts();
  }

  async notifyReportMetricts() {
    const data = await this.reportsService.getMetrics();
    this.server.emit("metrics", data);
  }

  @SubscribeMessage("getInitialReports")
  async handleGetInitialReports(@ConnectedSocket() client: Socket) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const reports = await this.reportsService.findAll({
      year,
      month,
      day,
      limit: 100,
      page: 1,
    });
    client.emit("initialReports", reports);
  }
  @SubscribeMessage("getInitiaMetrics")
  async handleGetInitialMetrics(@ConnectedSocket() client: Socket) {
    const metrics = await this.reportsService.getMetrics();
    client.emit("initialMetrics", metrics);
  }
}
