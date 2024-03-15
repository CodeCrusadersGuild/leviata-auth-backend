import { Injectable } from '@nestjs/common';
import { LoggerService } from './modules/Logger/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  getHello(): string {
    this.logger.log({ message: 'Obtendo exemplo...' });
    return 'Hello World!';
  }
}
