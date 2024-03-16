import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    const response = this.appService.getHello();
    this.appService.callExternalAPI();
    this.appService.processRequest('teste');
    // this.appService.throwError();
    return response;
  }
}
