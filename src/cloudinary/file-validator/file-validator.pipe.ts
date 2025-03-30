import { BadRequestException, Injectable, ParseFilePipe,  } from '@nestjs/common';
import { CustomFileTypeValidator } from './CustomFileTypeValidator ';

@Injectable()
export class FileValidatorPipe extends ParseFilePipe {

  constructor() {
    super({
      validators: [
        new CustomFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
      ],
      exceptionFactory: (error) => {
        if (error === 'File is required') {
          throw new BadRequestException('Por favor, sube un archivo de imagen.');
        }
        throw new BadRequestException('El archivo no es válido. Asegúrate de que sea una imagen (jpg, jpeg, png)');
      },

    });
  }
}
