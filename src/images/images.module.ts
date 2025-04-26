import { forwardRef, Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ReportsModule } from 'src/reports/reports.module';

@Module({
  imports: [
    forwardRef(() => ReportsModule), 
    PrismaModule, 
    CloudinaryModule
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService]
})
export class ImagesModule {}
