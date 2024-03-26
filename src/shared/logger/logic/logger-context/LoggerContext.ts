import { LocalStorage } from '../storage/LocalStorage';
import { ContextNamespace } from '../../enums/context-namespaces';
import { LoggerConfigs } from '../../config/logger-configs';

export class LoggerContext {
  /**
   * Sets the correlation ID in the logger context.
   * @param correlationId The correlation ID to set.
   */
  static setCorrelationId(correlationId: string): void {
    LocalStorage.setContextValue(
      'correlationId',
      correlationId,
      ContextNamespace.LOGGER,
    );
  }

  /**
   * Retrieves the correlation ID from the logger context.
   * @returns The correlation ID.
   */
  static getCorrelationId(): string {
    return LocalStorage.getContextValue(
      'correlationId',
      ContextNamespace.LOGGER,
    ) as string;
  }

  /**
   * Sets additional log info data in the logger context.
   * @param key The key of the data.
   * @param value The value of the data.
   */
  static setLogInfoData(key: string, value: unknown): void {
    LocalStorage.setContextValue(key, value, ContextNamespace.LOGGER);
  }

  /**
   * Retrieves additional log info data from the logger context.
   * @returns The additional log info data object.
   */
  static getLogInfoData(): object {
    return LocalStorage.getContextValue(
      'extraLogInfo',
      ContextNamespace.LOGGER,
    ) as object;
  }

  /**
   * Adds fields to the list of hidden fields in logs.
   * @param fields The fields to add to the list of hidden fields.
   */
  static addLoggerHiddenField(fields: Array<string>): void {
    fields = fields || [];
    LoggerConfigs.hiddenFields = LoggerConfigs.hiddenFields.concat(fields);
  }

  /**
   * Sets the list of hidden fields in logs.
   * @param fields The fields to set as hidden in logs.
   */
  static setLoggerHiddenField(fields: string[]): void {
    fields = fields || [];
    LoggerConfigs.hiddenFields = fields;
  }
}
