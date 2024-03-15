import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

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

  private logWithLevel(
    level: string,
    messageObject: { message: string; context?: string; timestamp?: string },
  ) {
    this.logger.log({
      level,
      message: messageObject.message,
      context: messageObject.context,
      timestamp: messageObject.timestamp,
    });
  }

  log(messageObject: {
    message: string;
    context?: string;
    timestamp?: string;
  }) {
    this.logWithLevel('info', messageObject);
  }

  error(
    messageObject: { message: string; context?: string; timestamp?: string },
    trace?: string,
  ) {
    this.logWithLevel('error', messageObject);
    if (trace) {
      this.logger.error(trace);
    }
  }

  warn(messageObject: {
    message: string;
    context?: string;
    timestamp?: string;
  }) {
    this.logWithLevel('warn', messageObject);
  }

  debug(messageObject: {
    message: string;
    context?: string;
    timestamp?: string;
  }) {
    this.logWithLevel('debug', messageObject);
  }
}
