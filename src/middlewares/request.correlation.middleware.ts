import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { ContextNamespace } from 'src/shared/logger/enums/context-namespaces';
import { LocalStorage } from 'src/shared/logger/LocalStorage';
import { LoggerContext } from 'src/shared/logger/LoggerContext';

@Injectable()
export class RequestCorrelationMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    await LocalStorage.runInContext(ContextNamespace.LOGGER, async () => {
      await this.setCorrelationId(req);
      next();
    });
  }

  private async setCorrelationId(req: Request): Promise<void> {
    const correlationId = req.headers['correlationId'] || uuid();
    req.headers['correlationId'] = correlationId;
    req['correlationId'] = correlationId;
    LoggerContext.setCorrelationId(correlationId.toString());
  }
}
