import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    ConfigModule.forRoot(),
    CategoriesModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
