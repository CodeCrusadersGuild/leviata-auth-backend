import { Injectable } from '@nestjs/common';
import { LocalStorageService } from './local.storage.service';
import { ContextNamespace } from '../enums/context-namespaces';
import { LoggerConfigs } from '../config/logger-configs';

@Injectable()
export class LoggerContextService {
  constructor(private readonly localStorageService: LocalStorageService) {}

  /**
   * Sets the correlation ID in the logger context.
   * @param correlationId The correlation ID to set.
   */
  public setCorrelationId(correlationId: string): void {
    this.localStorageService.setContextValue(
      'correlationId',
      correlationId,
      ContextNamespace.LOGGER,
    );
  }

  /**
   * Retrieves the correlation ID from the logger context.
   * @returns The correlation ID.
   */
  public getCorrelationId(): string {
    return this.localStorageService.getContextValue(
      'correlationId',
      ContextNamespace.LOGGER,
    ) as string;
  }

  /**
   * Sets additional log info data in the logger context.
   * @param key The key of the data.
   * @param value The value of the data.
   */
  public setLogInfoData(key: string, value: unknown): void {
    this.localStorageService.setContextValue(
      key,
      value,
      ContextNamespace.LOGGER,
    );
  }

  /**
   * Retrieves additional log info data from the logger context.
   * @returns The additional log info data object.
   */
  public getLogInfoData(): object {
    return this.localStorageService.getContextValue(
      'extraLogInfo',
      ContextNamespace.LOGGER,
    ) as object;
  }

  /**
   * Adds fields to the list of hidden fields in logs.
   * @param fields The fields to add to the list of hidden fields.
   */
  public static addLoggerHiddenField(fields: Array<string>): void {
    fields = fields || [];
    LoggerConfigs.hiddenFields = LoggerConfigs.hiddenFields.concat(fields);
  }

  /**
   * Sets the list of hidden fields in logs.
   * @param fields The fields to set as hidden in logs.
   */
  public setLoggerHiddenField(fields: string[]): void {
    fields = fields || [];
    LoggerConfigs.hiddenFields = fields;
  }
}
