import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { UsersService } from "./users.service";
import { PrismaService } from "src/prisma/prisma.service";
import { WsAuthService } from "src/auth/services/ws-auth.service";
import { forwardRef, Inject, UseGuards } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { WsAuthGuard } from "src/auth/decorators/ws-auth.guard";
import { User } from "@prisma/client";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  namespace: "workers",
})
export class UsersGateway {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly wsAuthService: WsAuthService
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

  async notifyNewWorker(newWorker: Partial<User>, departmentId: string) {

    this.server.to("admins").emit("newWorker", newWorker);
    this.server.to(`department_${departmentId}`).emit("newWorker", newWorker);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage("getWorkers")
  async emitWorkers(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    if (user.role === "admin") {
      const workers = await this.usersService.findAll(
        { limit: 1000, page: 1 },
        user
      );
      this.server.to("admins").emit("workers", workers);
    } else {
      const department = await this.prisma.department.findFirst({
        where: { id: user.department.id },
      });

      if ( !department ) return;

      const workers = await this.usersService.getWorkersByDepartment(
        department.id,
        { limit: 100, page:1 }
      );

      this.server.to(`department_${department.id}`).emit("workers", workers);
    }
  }
}
