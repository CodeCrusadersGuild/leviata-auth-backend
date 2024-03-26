import { LoggerBuilder } from './logic/builder/LoggerBuilder';
import { CallContext } from './logic/caller/CallContext';

/**
 * Service class for logging messages with different log levels.
 */
export class LoggerService {
  private static logger = LoggerBuilder.getLogger();

  /**
   * Logs a debug message.
   * @param args Additional arguments to be logged.
   */
  static debug(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.debug(LoggerService.handleNull(args));
  }

  /**
   * Logs an error message.
   * @param args Additional arguments to be logged.
   */
  static error(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.error(LoggerService.handleNull(args));
  }

  /**
   * Logs an info message.
   * @param args Additional arguments to be logged.
   */
  static info(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.info(LoggerService.handleNull(args));
  }

  /**
   * Logs a warning message.
   * @param args Additional arguments to be logged.
   */
  static warn(...args: unknown[]): void {
    args.push(LoggerService.getTraceLog());
    LoggerService.logger.warn(LoggerService.handleNull(args));
  }

  /**
   * Retrieves the class name and adds it to the log message as a trace.
   * @returns Object containing the class name.
   */
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

  /**
   * Handles null or undefined arguments by replacing them with 'null' in the log message.
   * @param args The arguments to be handled.
   * @returns An array of arguments with null or undefined values replaced by 'null'.
   */
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
