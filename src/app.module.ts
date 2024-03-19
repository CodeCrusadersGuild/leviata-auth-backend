import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestCorrelationMiddleware } from './middlewares/request.correlation.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestCorrelationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
