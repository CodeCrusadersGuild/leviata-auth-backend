import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { ContextNamespace } from 'src/shared/logger/enums/context-namespaces';
import { LocalStorage } from 'src/shared/logger/LocalStorage';
import { LoggerContext } from 'src/shared/logger/LoggerContext';

@Injectable()
export class RequestCorrelationMiddleware implements NestMiddleware {
  constructor() {}

  /**
   * Middleware function to handle correlation ID generation and storage.
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @param next The next function to be called in the middleware chain.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    await LocalStorage.runInContext(ContextNamespace.LOGGER, async () => {
      await this.setCorrelationId(req); // Set correlation ID for the request
      next(); // Call the next middleware or route handler
    });
  }

  /**
   * Sets the correlation ID for the incoming request.
   * @param req The HTTP request object.
   */
  private async setCorrelationId(req: Request): Promise<void> {
    // Generate correlation ID or use the one provided in the request header
    const correlationId = req.headers['correlationId'] || uuid();

    // Set correlation ID in request headers and properties
    req.headers['correlationId'] = correlationId;
    req['correlationId'] = correlationId;

    // Set correlation ID in logger context for logging purposes
    LoggerContext.setCorrelationId(correlationId.toString());
  }
}
