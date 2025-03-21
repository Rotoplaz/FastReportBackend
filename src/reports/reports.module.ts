import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [],
  controllers: [ReportsController],
  providers: [ReportsService, PrismaService, CloudinaryService],
})
export class ReportsModule {}
