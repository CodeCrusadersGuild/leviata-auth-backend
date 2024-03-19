import { Logger } from 'winston';
import { OriginFunction } from '../types/origin.function.type';
import { LoggerBuilder } from './LoggerBuilder';
import { Caller } from './Caller';

export class LoggerService {
  private static logger: Logger;

  static initialize(): void {
    LoggerService.logger = LoggerBuilder.getLogger();
  }

  static debug(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog(LoggerService.debug));
    LoggerService.logger.debug(LoggerService.handleNull(args));
  }

  static error(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog(LoggerService.error));
    LoggerService.logger.error(LoggerService.handleNull(args));
  }

  static info(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog(LoggerService.info));
    LoggerService.logger.info(LoggerService.handleNull(args));
  }

  static warn(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog(LoggerService.warn));
    LoggerService.logger.warn(LoggerService.handleNull(args));
  }

  private static async getTraceLog(
    method: OriginFunction,
  ): Promise<{ class: string }> {
    try {
      const callSite = await Caller.getCallerModule(method);
      if (callSite) {
        return {
          class: `${callSite.getTypeName()}`,
        };
      }
    } catch (err) {
      LoggerService.error('Error while getting caller module:', err);
    }
    return {
      class: '',
    };
  }

  private static handleNull(args: unknown[]): unknown[] {
    if (!args) {
      return [];
    }
    args.forEach((arg, index) => {
      if (arg === null || arg === undefined) {
        args[index] = 'null';
      }
    });
    return args;
  }
}
