import { Injectable } from '@nestjs/common';
import { LocalStorageLoggerService } from './local.storage.logger.context.service';
import { ContextNamespace } from './enums/context-namespaces';
import { LoggerConfigs } from './config/logger-configs';

@Injectable()
export class LoggerContextService {
  constructor(
    private readonly localStorageLoggerService: LocalStorageLoggerService,
  ) {}

  public setCorrelationId(correlationId: string): void {
    this.localStorageLoggerService.setLoggerContextValue(
      'correlationId',
      correlationId,
      ContextNamespace.LOGGER,
    );
  }

  public getCorrelationId(): string {
    return this.localStorageLoggerService.getLoggerContextValue(
      'correlationId',
      ContextNamespace.LOGGER,
    ) as string;
  }

  public setLogInfoData(key: string, value: unknown): void {
    this.localStorageLoggerService.setLoggerContextValue(
      key,
      value,
      ContextNamespace.LOGGER,
    );
  }

  public getLogInfoData(): object {
    return this.localStorageLoggerService.getLoggerContextValue(
      'extraLogInfo',
      ContextNamespace.LOGGER,
    ) as object;
  }

  public static addLoggerHidenField(fields: Array<string>): void {
    fields = fields || [];
    LoggerConfigs.hiddenFields = LoggerConfigs.hiddenFields.concat(fields);
  }

  public static setLoggerHidenField(fields: Array<string>): void {
    fields = fields || [];
    LoggerConfigs.hiddenFields = fields;
  }
}
