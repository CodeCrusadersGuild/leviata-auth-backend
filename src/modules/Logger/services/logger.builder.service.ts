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
   * @returns A formatted log message based on the provided custom function.
   */
  private customJsonFormat(custom: (info: any, opts?: any) => any): any {
    const defaultCustom = this.defaultCustom();
    return format(custom || defaultCustom)();
  }

  private defaultCustom(): (info: any, opts?: any) => any {
    return (info, opts) => {
      if (opts.yell) {
        info.message = info.message.toUpperCase();
      } else if (opts.whisper) {
        info.message = info.message.toLowerCase();
      }

      info.level = info.level.toUpperCase();
      info.level = info.level.toUpperCase();
      info.correlationId =
        this.loggerContextService.getCorrelationId() || uuid();
      const extraData = this.loggerContextService.getLogInfoData();
      if (extraData) {
        Object.keys(extraData).forEach(key => {
          info[key] = extraData[key];
        });
      }

      let text;
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

      return info;
    };
  }

  private loadInfoItems(
    item: Array<unknown>,
    info: { [key: string]: any },
    text: string,
  ): string {
    try {
      if (item instanceof TypeError || item instanceof Error) {
        info['errorMessage'] = item.message;
        info['stackError'] = item.stack;
      } else if (typeof item === 'string') {
        text = `${!text ? item : `${text} ${item}`}`;
      } else if (typeof item === 'object') {
        Object.keys(item).forEach(key => {
          if (
            this.shouldHide(key) &&
            !(process.env.SHOW_SENSETIVE_LOG == 'true')
          ) {
            info[key] = LoggerConstants.HidenLogFieldLabel;
          } else {
            info[key] = item[key];
          }
        });
      }
    } catch (error) {
      console.log('ERROR', error);
    }
    return text;
  }

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
