import { Module } from '@nestjs/common';
import { CallerService } from './services/caller.service';
import { LocalStorageService } from './services/local.storage.service';
import { LoggerBuilderService } from './services/logger.builder.service';
import { LoggerContextService } from './services/logger.context.service';
import { StackTraceService } from './services/stack.trace.service';
import { LoggerService } from './services/logger.service';
import { RequestLoggingMiddleware } from './middlewares/request.logging.middleware';

@Module({
  providers: [
    CallerService,
    LocalStorageService,
    LoggerBuilderService,
    LoggerContextService,
    StackTraceService,
    LoggerService,
    RequestLoggingMiddleware,
  ],
  exports: [
    LoggerService,
    RequestLoggingMiddleware,
    LocalStorageService,
    LoggerContextService,
  ],
})
export class LoggerModule {}
