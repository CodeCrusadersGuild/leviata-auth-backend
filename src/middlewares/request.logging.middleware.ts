import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { ContextNamespace } from 'src/shared/logger/enums/context-namespaces';
import { LoggerConstants } from 'src/shared/logger/constants/logger-constants';
import { LogLevel } from 'src/shared/logger/enums/log.level';
import { LogActions } from 'src/shared/logger/enums/log.actions';
import { ResponseLog } from 'src/shared/logger/types/response.log.types';
import { LocalStorage } from 'src/shared/logger/services/LocalStorage';
import { LoggerContext } from 'src/shared/logger/services/LoggerContext';
import { LoggerService } from 'src/shared/logger/services/LoggerService';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    await LocalStorage.runInContext(ContextNamespace.LOGGER, async () => {
      await this.setCorrelationId(req);
      const reqLog = this.createRequestLog(req);

      const chunks: Array<any> = [];
      this.overrideResponseWriteMethod(res, chunks);
      this.overrideResponseEndMethod(res, chunks, req, reqLog);

      next();
    });
  }

  private async setCorrelationId(req: Request): Promise<void> {
    const correlationId = req.headers['correlationId'] || uuid();
    req.headers['correlationId'] = correlationId;
    req['correlationId'] = correlationId;
    LoggerContext.setCorrelationId(correlationId.toString());
  }

  private createRequestLog(req: Request): any {
    return {
      method: req.method.toLocaleUpperCase(),
      path: req.path,
      route: req.route,
      agent: req.get('user-agent'),
      ip: req.hostname,
      query: req.query,
      params: req.params,
      headers: req.headers,
      body: req.body,
    };
  }

  private overrideResponseWriteMethod(res: Response, chunks: any[]): void {
    const { write } = res;
    res.write = (...restArgs: any): any => {
      chunks.push(Buffer.from(restArgs[0]));
      return write.apply(res, restArgs);
    };
  }

  private overrideResponseEndMethod(
    res: Response,
    chunks: any[],
    req: Request,
    reqLog: any,
  ): void {
    const { end } = res;
    res.end = (...restArgs: any): any => {
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      try {
        res.setHeader(
          LoggerConstants.CorrelationIdHeader,
          LoggerContext.getCorrelationId(),
        );
      } catch (error) {
        LoggerService.error(error);
      }
      const respLog: ResponseLog = {
        method: req.method,
        path: reqLog.path,
        route: reqLog.route,
        agent: reqLog.agent,
        ip: reqLog.ip,
        duration: new Date().getTime() - new Date().getTime(),
        statusCode: res.statusCode,
        query: req.query,
        params: req.params,
        headers: res.getHeaders(),
        data: this.getResponseBody(chunks),
      };
      this.logResponse(respLog);
      end.apply(res, restArgs);
    };
  }

  private logResponse(reqLog: ResponseLog): void {
    const logObject = {
      action: LogActions.Response,
      ...reqLog,
    };

    this.log(logObject, undefined);
  }

  private getResponseBody(chunks: any[]): any {
    try {
      if (chunks) {
        const body = Buffer.concat(chunks).toString('utf8');
        return body;
      }
    } catch (err) {
      LoggerService.warn(err);
    }
    return '';
  }

  private log(log: { [key: string]: unknown }, level?: LogLevel): void {
    level = level || LogLevel.INFO;
    switch (level) {
      case LogLevel.INFO:
        LoggerService.info(log);
        break;
      case LogLevel.WARN:
        LoggerService.warn(log);
        break;
      case LogLevel.ERROR:
        LoggerService.error(log);
        break;
      default:
        LoggerService.debug(log);
        break;
    }
  }
}
