import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { LoggerBuilderService } from './logger.builder.service';
import { CallerService } from './caller.service';
import { OriginFunction } from '../types/origin.function.type';

@Injectable()
export class LoggerService {
  private readonly logger: Logger;

  constructor(
    private readonly loggerBuilderService: LoggerBuilderService,
    private readonly callerService: CallerService,
  ) {
    this.logger = this.loggerBuilderService.getLogger();
  }

  debug(...args: unknown[]): void {
    args.push(this.getTraceLog(this.debug));
    this.logger.debug(this.handleNull(args));
  }

  error(...args: unknown[]): void {
    args.push(this.getTraceLog(this.error));
    this.logger.error(this.handleNull(args));
  }

  info(...args: unknown[]): void {
    args.push(this.getTraceLog(this.info));
    this.logger.info(this.handleNull(args));
  }

  warn(...args: unknown[]): void {
    args.push(this.getTraceLog(this.warn));
    this.logger.warn(this.handleNull(args));
  }

  private async getTraceLog(
    method: OriginFunction,
  ): Promise<{ class: string }> {
    try {
      const callSite = await this.callerService.getCallerModule(method);
      if (callSite) {
        return {
          class: `${callSite.getTypeName()}`,
        };
      }
    } catch (err) {
      this.error('Error while getting caller module:', err);
    }
    return {
      class: '',
    };
  }

  private handleNull(args: unknown[]): unknown[] {
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
