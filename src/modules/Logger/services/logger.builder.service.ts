import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { createLogger, transports, format } from 'winston';
import { v4 as uuid } from 'uuid';
import { Environment } from '../enums/environment';
import { LoggerContextService } from './logger.context.service';
import { LoggerConstants } from '../constants/logger-constants';
import { LoggerConfigs } from '../config/logger-configs';

@Injectable()
export class LoggerBuilder {
  constructor(private readonly loggerContextService: LoggerContextService) {}

  /**
   * Gets the appropriate logger based on the environment.
   * In the local environment, a logger with pretty printing is created.
   * In other environments (e.g., AWS), a default logger is created.
   * @param custom A custom formatting function for log messages.
   * @returns An instance of the Winston logger.
   */
  getLogger(custom?: (info: any, opts?: any) => any): Logger {
    return process.env.NODE_ENV === Environment.LOCAL
      ? this.createLocalWinstonLogger(custom)
      : this.createDefaultWinstonLogger(custom);
  }

  /**
   * Creates a logger instance suitable for local development.
   * Includes pretty printing for human-readable logs.
   * @param custom A custom formatting function for log messages.
   * @returns An instance of the Winston logger for local development.
   */
  private createLocalWinstonLogger(
    custom: (info: any, opts?: any) => any = this.defaultCustom(),
  ): Logger {
    return createLogger({
      level: this.getLogLevel(),
      format: format.combine(
        format.json(),
        this.customJsonFormat(custom),
        format.timestamp(),
        format.prettyPrint(),
      ),
      transports: [new transports.Console()],
    });
  }

  /**
   * Creates a default logger instance suitable for production environments (e.g., AWS).
   * @param custom A custom formatting function for log messages.
   * @returns An instance of the default Winston logger for production environments.
   */
  private createDefaultWinstonLogger(
    custom: (info: any, opts?: any) => any = this.defaultCustom(),
  ): Logger {
    return createLogger({
      level: this.getLogLevel(),
      format: format.combine(
        format.timestamp(),
        this.customJsonFormat(custom),
        format.json(),
      ),
      transports: [new transports.Console()],
    });
  }

  /**
   * Formats log messages using a custom formatting function if provided,
   * otherwise applies the default custom formatting logic.
   * @param custom A custom formatting function for log messages.
   * @returns A formatted log message based on the provided custom function.
   */
  private customJsonFormat(custom: (info: any, opts?: any) => any): any {
    const defaultCustom = this.defaultCustom();
    return format(custom || defaultCustom)();
  }

  /**
   * Creates a default custom formatting function for log messages.
   * Applies various transformations to log messages, including case modifications,
   * adding correlation IDs, extra data, and combining message items.
   * @returns A custom formatting function for log messages.
   */
  private defaultCustom(): (info: any, opts?: any) => any {
    return (info, opts) => {
      this.formatMessageCase(info, opts);
      this.formatLogLevel(info);
      this.formatCorrelationId(info);
      this.addExtraData(info);
      this.combineMessageItems(info);
      return info;
    };
  }

  /**
   * Modifies the case of log messages based on provided options.
   * @param info The log message object.
   * @param opts Options for customizing log message formatting.
   */
  private formatMessageCase(info: any, opts?: any): void {
    if (!opts) return;
    if (opts.yell) {
      info.message = info.message.toUpperCase();
    } else if (opts.whisper) {
      info.message = info.message.toLowerCase();
    }
  }

  /**
   * Converts log level to uppercase.
   * @param info The log message object.
   */
  private formatLogLevel(info: any): void {
    info.level = info.level.toUpperCase();
  }

  /**
   * Adds a correlation ID to the log message.
   * @param info The log message object.
   */
  private formatCorrelationId(info: any): void {
    info.correlationId = this.loggerContextService.getCorrelationId() || uuid();
  }

  /**
   * Adds extra data to the log message based on the current context.
   * @param info The log message object.
   */
  private addExtraData(info: any): void {
    const extraData = this.loggerContextService.getLogInfoData();
    if (extraData) {
      Object.assign(info, extraData);
    }
  }

  /**
   * Combines message items into a single text message.
   * @param info The log message object.
   */
  private combineMessageItems(info: any): void {
    let text = '';
    for (const item of info.message) {
      if (!item) {
        continue;
      }
      if (typeof item === 'string' || typeof item === 'number') {
        text = `${!text ? item : `${text} ${item}`}`;
      } else if (Array.isArray(item)) {
        for (const arrayItem of item) {
          text = this.loadInfoItems(arrayItem, info, text);
        }
      } else if (typeof item === 'object') {
        text = this.loadInfoItems(item, info, text);
      } else {
        info['__data'] = item;
      }
    }
    delete info.message;
    info.message = text;
  }

  /**
   * Processes individual items within log message arrays or objects.
   * @param item A single item within the log message.
   * @param info The log message object.
   * @param text The current text representation of the log message.
   * @returns The updated text representation of the log message.
   */
  private loadInfoItems(
    item: Array<unknown>,
    info: { [key: string]: any },
    text: string,
  ): string {
    try {
      if (item instanceof TypeError || item instanceof Error) {
        this.handleTypeErrorOrError(item, info);
      } else if (typeof item === 'string') {
        text = this.handleStringItem(item, text);
      } else if (typeof item === 'object') {
        this.handleObjectItem(item, info);
      }
    } catch (error) {
      console.log('ERROR', error);
    }
    return text;
  }

  /**
   * Handles error messages by extracting error details.
   * @param item The error object.
   * @param info The log message object.
   */
  private handleTypeErrorOrError(
    item: TypeError | Error,
    info: { [key: string]: any },
  ): void {
    info['errorMessage'] = item.message;
    info['stackError'] = item.stack;
  }

  /**
   * Handles string items within log messages.
   * @param item The string item.
   * @param text The current text representation of the log message.
   * @returns The updated text representation of the log message.
   */
  private handleStringItem(item: string, text: string): string {
    return `${!text ? item : `${text} ${item}`}`;
  }

  /**
   * Handles object items within log messages, adding them to the log message with optional hiding of sensitive fields.
   * @param item The object item.
   * @param info The log message object.
   */
  private handleObjectItem(
    item: { [key: string]: any },
    info: { [key: string]: any },
  ): void {
    Object.keys(item).forEach(key => {
      if (this.shouldHide(key) && !(process.env.SHOW_SENSETIVE_LOG == 'true')) {
        info[key] = LoggerConstants.HidenLogFieldLabel;
      } else {
        info[key] = item[key];
      }
    });
  }

  /**
   * Determines if a log message field should be hidden based on configuration.
   * @param key The field key.
   * @returns A boolean indicating whether the field should be hidden.
   */
  private shouldHide(key: string): boolean {
    key = key || '';
    key = key.toLocaleLowerCase();
    return LoggerConfigs.hiddenFields.includes(key);
  }

  /**
   * Gets the log level based on the environment configuration.
   * Defaults to 'debug' if not specified.
   * @returns The log level for the Winston logger.
   */
  private getLogLevel(): string {
    return process.env.LOG_LEVEL
      ? process.env.LOG_LEVEL.toLowerCase()
      : 'debug';
  }
}
