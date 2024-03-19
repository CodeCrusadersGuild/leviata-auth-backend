import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { RequestLoggingMiddleware } from './middlewares/request.logging.middleware';

@Module({
  providers: [RequestLoggingMiddleware, LoggerService],
  exports: [RequestLoggingMiddleware, LoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
