import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LoggerService } from 'src/shared/logger/LoggerService';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  /**
   * Intercepts incoming requests to log request data.
   * @param context The execution context.
   * @param next The next call handler in the interceptor chain.
   * @returns An observable of the response data.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestData = {
      method: request.method,
      path: request.url,
      headers: request.headers,
      body: request.body,
      query: request.query,
    };
    LoggerService.debug('[RequestInterceptor] Request Data', requestData);
    return next.handle();
  }
}
