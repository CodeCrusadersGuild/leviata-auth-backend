import { LoggerBuilder } from './LoggerBuilder';
import { CallContext } from './CallContext';

export class LoggerService {
  private static logger = LoggerBuilder.getLogger();

  static debug(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.debug(LoggerService.handleNull(args));
  }

  static error(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.error(LoggerService.handleNull(args));
  }

  static info(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.info(LoggerService.handleNull(args));
  }

  static warn(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.warn(LoggerService.handleNull(args));
  }

  private static getTraceLog(): { class: string } {
    try {
      const callerModuleInfo = CallContext.getCallerModuleInfo();
      return {
        class: callerModuleInfo.name,
      };
    } catch (err) {
      return {
        class: '',
      };
    }
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
