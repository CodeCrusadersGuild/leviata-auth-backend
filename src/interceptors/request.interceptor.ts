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
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const startTime = Date.now();

    const requestData = {
      method: request.method,
      path: request.url,
      headers: request.headers,
      body: request.body,
      query: request.query,
    };

    LoggerService.debug('[RequestInterceptor] Request Data', requestData);

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

        LoggerService.debug('[RequestInterceptor] Response Data', responseLog);
      }),
    );
  }
}
