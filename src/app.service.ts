import { Injectable } from '@nestjs/common';
import { LoggerService } from './shared/logger/services/LoggerService';
import { log } from './shared/logger/decorators/log-decorator';

@Injectable()
export class AppService {
  @log()
  getHello(): string {
    LoggerService.info('Olá família');
    LoggerService.info('Olá família 2');
    return 'Hello World!';
  }
}
