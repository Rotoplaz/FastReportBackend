import { forwardRef, Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ImagesModule } from 'src/images/images.module';
import { ReportsGateway } from './reports.gateway';

@Module({
  imports: [PrismaModule,  CloudinaryModule, forwardRef(() => ImagesModule)],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsGateway],
  exports: [ReportsService]
})
export class ReportsModule {}
