import { Injectable, ParseFilePipe,  } from '@nestjs/common';
import { CustomFileTypeValidator } from './CustomFileTypeValidator ';

@Injectable()
export class FileValidatorPipe extends ParseFilePipe {

  constructor() {
    super({
      validators: [
        new CustomFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
      ],
    });
  }
}
