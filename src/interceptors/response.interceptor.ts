import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from 'src/shared/logger/LoggerService';
import { ApiResponse } from 'src/shared/types/api.response';
import { ResponseLog } from 'src/shared/logger/types/response.log.type';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  /**
   * Intercepts outgoing responses to log response data.
   * @param context The execution context.
   * @param next The next call handler in the interceptor chain.
   * @returns An observable of the response data.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    return next.handle().pipe(
      tap((response: ApiResponse<unknown>) => {
        if (!response) {
          return;
        }
        const duration = Date.now() - startTime;
        const responseLog: ResponseLog = {
          method: request.method,
          path: request.url,
          route: request.route.path,
          agent: request.get('user-agent'),
          ip: request.ip,
          duration: duration,
          statusCode: response.statusCode,
          query: request.query,
          params: request.params,
          data: response.data,
        };
        LoggerService.debug('[ResponseInterceptor] Response Data', responseLog);
      }),
    );
  }
}
