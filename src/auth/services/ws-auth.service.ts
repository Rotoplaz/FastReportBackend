import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { Socket } from "socket.io";

@Injectable()
export class WsAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async authenticateClient(client: Socket) {
    const raw =
      client.handshake.auth?.token || client.handshake.headers?.authorization;

    if (!raw) throw new Error("Token ausente");

    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
    const payload = this.jwtService.verify<{ id: string }>(token);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      include: { supervisesDepartment: true },
    });

    if (!user) throw new Error("Usuario no encontrado en DB");
    client.data.user = user;
    client.emit("authenticated");

    if (user.role === "supervisor" && user.supervisesDepartment) {
      client.join(`department_${user.supervisesDepartment.id}`);
    } else if (user.role === "admin") {
      client.join("admins");
    }

    return user;
  }
}
