import { Logger } from 'winston';
import { createLogger, transports, format } from 'winston';
import { v4 as uuid } from 'uuid';
import { Environment } from '../../enums/environment';
import { LoggerConstants } from '../../constants/logger-constants';
import { LoggerConfigs } from '../../config/logger-configs';
import { LoggerContext } from '../logger-context/LoggerContext';

export class LoggerBuilder {
  /**
   * Retrieves an instance of the logger based on the environment.
   * If the environment is local, a logger with customized formatting is returned.
   * If the environment is not local, a default logger with JSON formatting is returned.
   * @param custom A custom formatting function for the logger (optional).
   * @returns An instance of the logger.
   */
  static getLogger(custom?: (info: any, opts?: any) => any): Logger {
    return process.env.NODE_ENV === Environment.LOCAL
      ? this.createLocalWinstonLogger(custom)
      : this.createDefaultWinstonLogger(custom);
  }

  /**
   * Creates a logger instance with customized formatting for the local environment.
   * @param custom A custom formatting function for the logger (optional).
   * @returns An instance of the logger.
   */
  private static createLocalWinstonLogger(
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
   * Creates a default logger instance with JSON formatting.
   * @param custom A custom formatting function for the logger (optional).
   * @returns An instance of the logger.
   */
  private static createDefaultWinstonLogger(
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
   * Creates a custom JSON formatting for the logger.
   * @param custom A custom formatting function for the logger.
   * @returns Custom formatting for the logger.
   */
  private static customJsonFormat(custom: (info: any, opts?: any) => any): any {
    const defaultCustom = this.defaultCustom();
    return format(custom || defaultCustom)();
  }

  /**
   * Returns the default custom formatting function for the logger.
   * @returns Default custom formatting function for the logger.
   */
  private static defaultCustom(): (info: any, opts?: any) => any {
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
   * Formats the message case based on the options provided.
   * @param info The log message information.
   * @param opts The formatting options.
   */
  private static formatMessageCase(info: any, opts?: any): void {
    if (!opts) return;
    if (opts.yell) {
      info.message = info.message.toUpperCase();
    } else if (opts.whisper) {
      info.message = info.message.toLowerCase();
    }
  }

  /**
   * Formats the log level to uppercase.
   * @param info The log message information.
   */
  private static formatLogLevel(info: any): void {
    info.level = info.level.toUpperCase();
  }

  /**
   * Formats and adds a correlation ID to the log message information.
   * @param info The log message information.
   */
  private static formatCorrelationId(info: any): void {
    info.correlationId = LoggerContext.getCorrelationId() || uuid();
  }

  /**
   * Adds extra data to the log message information.
   * @param info The log message information.
   */
  private static addExtraData(info: any): void {
    const extraData = LoggerContext.getLogInfoData();
    if (extraData) {
      Object.assign(info, extraData);
    }
  }

  /**
   * Combines multiple items in the log message into a single string.
   * @param info The log message information.
   */
  private static combineMessageItems(info: any): void {
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
   * Loads items from the log message and formats them accordingly.
   * @param item The item from the log message.
   * @param info The log message information.
   * @param text The current text content.
   * @returns The updated text content.
   */
  private static loadInfoItems(
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
   * Handles TypeError or Error objects and adds them to the log message.
   * @param item The TypeError or Error object.
   * @param info The log message information.
   */
  private static handleTypeErrorOrError(
    item: TypeError | Error,
    info: { [key: string]: any },
  ): void {
    info['errorMessage'] = item.message;
    info['stackError'] = item.stack;
  }

  /**
   * Handles string items and appends them to the existing text.
   * @param item The string item to be handled.
   * @param text The current text content.
   * @returns The updated text content.
   */
  private static handleStringItem(item: string, text: string): string {
    return `${!text ? item : `${text} ${item}`}`;
  }

  /**
   * Handles object items and adds them to the log message information.
   * @param item The object item to be handled.
   * @param info The log message information.
   */
  private static handleObjectItem(
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
   * Determines whether a log field should be hidden based on configuration.
   * @param key The key of the log field.
   * @returns True if the log field should be hidden, false otherwise.
   */
  private static shouldHide(key: string): boolean {
    key = key || '';
    key = key.toLocaleLowerCase();
    return LoggerConfigs.hiddenFields.includes(key);
  }

  /**
   * Retrieves the log level from environment variables.
   * Defaults to 'debug' if not specified.
   * @returns The log level.
   */
  private static getLogLevel(): string {
    return process.env.LOG_LEVEL
      ? process.env.LOG_LEVEL.toLowerCase()
      : 'debug';
  }
}
