import { BadGatewayException, Injectable } from '@nestjs/common';
import { FileTypeValidator } from '@nestjs/common/pipes';

@Injectable()
export class CustomFileTypeValidator extends FileTypeValidator {
  constructor(options: { fileType: string | RegExp }) {
    super(options);
  }

  isValid(file: Express.Multer.File): boolean {
    const isValid = super.isValid(file);
    if (!isValid) {
      throw new BadGatewayException('Solo se permiten archivos de tipo JPG, JPEG o PNG.');
    }
    return true;
  }
}