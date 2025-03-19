import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  controllers: [CloudinaryController],
  imports: [ConfigModule],
  providers: [
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: ConfigService) => {
        return cloudinary.config({
          cloud_name: configService.get('CLOUD_NAME'),
          api_key: configService.get('API_KEY'),
          api_secret: configService.get('API_SECRET'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [CloudinaryService]
})
export class CloudinaryModule {}