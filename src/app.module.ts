import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    ConfigModule.forRoot(),
    CategoriesModule,
    ReportsModule,
    CloudinaryModule,
    AssignmentsModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
