import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { LocalStorageService } from '../services/local.storage.service';
import { ContextNamespace } from '../enums/context-namespaces';
import { LoggerConstants } from '../constants/logger-constants';
import { LoggerContextService } from '../services/logger.context.service';
import { LoggerService } from '../services/logger.service';
import { LogLevel } from '../enums/log.level';
import { LogActions } from '../enums/log.actions';
import { ResponseLog } from '../types/response.log.types';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly loggerContextService: LoggerContextService,
    private readonly loggerService: LoggerService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    await this.localStorageService.runInContext(
      ContextNamespace.LOGGER,
      async () => {
        await this.setCorrelationId(req);
        const reqLog = this.createRequestLog(req);

        const chunks: Array<any> = [];
        this.overrideResponseWriteMethod(res, chunks);
        this.overrideResponseEndMethod(res, chunks, req, reqLog);

        next();
      },
    );
  }

  private async setCorrelationId(req: Request): Promise<void> {
    const correlationId = req.headers['correlationId'] || uuid();
    req.headers['correlationId'] = correlationId;
    req['correlationId'] = correlationId;
    this.loggerContextService.setCorrelationId(correlationId.toString());
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
          this.loggerContextService.getCorrelationId(),
        );
      } catch (error) {
        this.loggerService.error(error);
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
      this.loggerService.warn(err);
    }
    return '';
  }

  private log(log: { [key: string]: unknown }, level?: LogLevel): void {
    level = level || LogLevel.INFO;
    switch (level) {
      case LogLevel.INFO:
        this.loggerService.info(log);
        break;
      case LogLevel.WARN:
        this.loggerService.warn(log);
        break;
      case LogLevel.ERROR:
        this.loggerService.error(log);
        break;
      default:
        this.loggerService.debug(log);
        break;
    }
  }
}
