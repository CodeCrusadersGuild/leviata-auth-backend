import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from './shared/types/api.response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): ApiResponse<string> {
    const response = this.appService.getHello();
    return {
      statusCode: 200,
      statusMessage: 'Success',
      data: response,
      success: true,
    };
  }
}
