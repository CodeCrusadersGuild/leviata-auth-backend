import { Logger } from 'winston';
import { createLogger, transports, format } from 'winston';
import { v4 as uuid } from 'uuid';
import { Environment } from './enums/environment';
import { LoggerConstants } from './constants/logger-constants';
import { LoggerConfigs } from './config/logger-configs';
import { LoggerContext } from './LoggerContext';

export class LoggerBuilder {
  static getLogger(custom?: (info: any, opts?: any) => any): Logger {
    return process.env.NODE_ENV === Environment.LOCAL
      ? this.createLocalWinstonLogger(custom)
      : this.createDefaultWinstonLogger(custom);
  }

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

  private static customJsonFormat(custom: (info: any, opts?: any) => any): any {
    const defaultCustom = this.defaultCustom();
    return format(custom || defaultCustom)();
  }

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

  private static formatMessageCase(info: any, opts?: any): void {
    if (!opts) return;
    if (opts.yell) {
      info.message = info.message.toUpperCase();
    } else if (opts.whisper) {
      info.message = info.message.toLowerCase();
    }
  }

  private static formatLogLevel(info: any): void {
    info.level = info.level.toUpperCase();
  }

  private static formatCorrelationId(info: any): void {
    info.correlationId = LoggerContext.getCorrelationId() || uuid();
  }

  private static addExtraData(info: any): void {
    const extraData = LoggerContext.getLogInfoData();
    if (extraData) {
      Object.assign(info, extraData);
    }
  }

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

  private static handleTypeErrorOrError(
    item: TypeError | Error,
    info: { [key: string]: any },
  ): void {
    info['errorMessage'] = item.message;
    info['stackError'] = item.stack;
  }

  private static handleStringItem(item: string, text: string): string {
    return `${!text ? item : `${text} ${item}`}`;
  }

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

  private static shouldHide(key: string): boolean {
    key = key || '';
    key = key.toLocaleLowerCase();
    return LoggerConfigs.hiddenFields.includes(key);
  }

  private static getLogLevel(): string {
    return process.env.LOG_LEVEL
      ? process.env.LOG_LEVEL.toLowerCase()
      : 'debug';
  }
}
