import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestCorrelationMiddleware } from './middlewares/request.correlation.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestInterceptor } from './interceptors/request.interceptor';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestCorrelationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
