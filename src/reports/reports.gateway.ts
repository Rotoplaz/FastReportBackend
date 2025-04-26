import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Report } from '@prisma/client';

@WebSocketGateway({
  cors: true,
  namespace: 'reports'
})
export class ReportsGateway {
  @WebSocketServer()
  server: Server;

  notifyNewReport(report: Report) {
    this.server.emit('newReport', report);
  }

  notifyReportUpdate(report: Report) {
    this.server.emit('reportUpdate', report);
  }
}