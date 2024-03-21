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

@Injectable()
export class RequestInterceptor implements NestInterceptor {
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

    return next.handle().pipe(
      tap((response: ApiResponse<unknown>) => {
        if (!response) {
          return;
        }

        LoggerService.debug('[RequestInterceptor] Response Data', response);
      }),
    );
  }
}
