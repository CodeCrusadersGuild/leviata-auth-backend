import { Injectable } from '@nestjs/common';
import { LoggerService } from './modules/Logger/logger.service';
import { Log } from './modules/Logger/decorators/log.decorator';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  @Log()
  getHello(): string {
    // Método simples sem parâmetros
    return 'Hello World!';
  }

  @Log()
  callExternalAPI(): void {
    // Método simulando chamada a uma API externa
    console.log('Calling external API...');
  }

  @Log()
  processRequest(data: any): void {
    // Método que recebe parâmetros e realiza algum processamento
    console.log('Processing request with data:', data);
  }

  @Log()
  throwError(): void {
    // Método que lança uma exceção
    throw new Error('Erro Simulado');
  }
}
