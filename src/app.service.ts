import { Injectable } from '@nestjs/common';
import { LoggerService } from './modules/Logger/services/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  getHello(): string {
    this.logger.info('Olá caralho');
    this.logger.info('Olá caralho 2');
    return 'Hello World!';
  }
}
