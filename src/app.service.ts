import { Injectable } from '@nestjs/common';
import { LoggerService } from './shared/logger/services/LoggerService';

@Injectable()
export class AppService {
  getHello(): string {
    LoggerService.info('Olá família');
    LoggerService.info('Olá família 2');
    return 'Hello World!';
  }
}
