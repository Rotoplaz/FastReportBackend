import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DepartmentsModule } from './departments/departments.module';
import { ReportsModule } from './reports/reports.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ImagesModule } from './images/images.module';
import { EvidencesModule } from './evidences/evidences.module';
import { SeedModule } from './seed/seed.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    ConfigModule.forRoot(),
    DepartmentsModule,
    ReportsModule,
    CloudinaryModule,
    AssignmentsModule,
    ImagesModule,
    EvidencesModule,
    SeedModule,
    WorkersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
