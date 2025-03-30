import { Module } from '@nestjs/common';
import { EvidencesService } from './evidences.service';
import { EvidencesController } from './evidences.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ReportsModule } from 'src/reports/reports.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, ReportsModule],
  controllers: [EvidencesController],
  providers: [EvidencesService],
  exports: [EvidencesService]
})
export class EvidencesModule {}
