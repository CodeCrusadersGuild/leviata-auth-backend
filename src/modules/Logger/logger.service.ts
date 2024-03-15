import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { LogEntry } from './types/log.entry.type';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private logWithLevel(level: string, logEntry: LogEntry) {
    this.logger.log({
      level,
      message: logEntry.message,
      context: logEntry.context,
      timestamp: logEntry.timestamp,
    });
  }

  log(logEntry: LogEntry) {
    this.logWithLevel('info', logEntry);
  }

  error(logEntry: LogEntry, trace?: string) {
    this.logWithLevel('error', logEntry);
    if (trace) {
      this.logger.error(trace);
    }
  }

  warn(logEntry: LogEntry) {
    this.logWithLevel('warn', logEntry);
  }

  debug(logEntry: LogEntry) {
    this.logWithLevel('debug', logEntry);
  }
}
