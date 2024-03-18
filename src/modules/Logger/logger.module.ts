import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CallerService } from './services/caller.service';
import { LocalStorageService } from './services/local.storage.service';
import { LoggerBuilderService } from './services/logger.builder.service';
import { LoggerContextService } from './services/logger.context.service';
import { StackTraceService } from './services/stack.trace.service';
import { LoggerService } from './services/logger.service';
import { RequestLoggingMiddleware } from './middlewares/request.logging.middleware';

@Module({
  providers: [
    RequestLoggingMiddleware,
    CallerService,
    LocalStorageService,
    LoggerBuilderService,
    LoggerContextService,
    StackTraceService,
    LoggerService,
  ],
  exports: [
    RequestLoggingMiddleware,
    LoggerService,
    LocalStorageService,
    LoggerContextService,
  ],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
