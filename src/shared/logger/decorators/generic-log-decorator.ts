import { LogLevel } from '../enums/log.level';
import { LogActions } from '../enums/log.actions';
import { LoggerService } from '../LoggerService';
import { LogTrace } from '../types/log.trace.type';

export abstract class GenericLogDecorator {
  private static handleParameters(args: any[], parameters: any[]): any[] {
    for (const parameter of parameters) {
      if (typeof parameter === 'object') {
        if (
          parameter != null &&
          parameter &&
          parameter.constructor &&
          parameter.constructor.name === 'Object'
        ) {
          args.push(parameter);
        }
      } else {
        args.push(parameter);
      }
    }
    return args;
  }

  private static handlerMethodTrace(
    logTrace: LogTrace,
    start: Date,
    logLevel: LogLevel,
    err?: Error,
  ): void {
    if (err) {
      logTrace.hasFailed = true;
      logTrace.errorMessage = err.message;
    }
    logTrace.duration = new Date().getTime() - start.getTime();
    if (logLevel === LogLevel.DEBUG && logTrace.hasFailed) {
      LoggerService.warn(`Called method: ${logTrace.method}`, logTrace);
    } else {
      LoggerService[logLevel](`Called method: ${logTrace.method}`, logTrace);
    }
  }

  private static handleAsyncFunction(
    result: any,
    logTrace: LogTrace,
    start: Date,
    logLvel: LogLevel,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      result
        .then((funcResult: any) => {
          GenericLogDecorator.handlerMethodTrace(logTrace, start, logLvel);
          return resolve(funcResult);
        })
        .catch((err: Error | undefined) => {
          GenericLogDecorator.handlerMethodTrace(logTrace, start, logLvel, err);
          return reject(err);
        });
    });
  }

  protected static apply(
    key: PropertyKey,
    descriptor: PropertyDescriptor,
    logLevel: LogLevel,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = new Date();
      const argsArray = GenericLogDecorator.handleParameters([], args);
      const constructorName =
        this && this.constructor ? this.constructor.name : 'unknown';
      const logTrace: LogTrace = {
        action: LogActions.MethodTrace,
        method: `${constructorName}.${String(key)}`,
        class: constructorName,
        function: String(key),
        parameters: argsArray,
        hasFailed: false,
      };
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return GenericLogDecorator.handleAsyncFunction(
            result,
            logTrace,
            start,
            logLevel,
          );
        }
        GenericLogDecorator.handlerMethodTrace(logTrace, start, logLevel);
        return result;
      } catch (err) {
        GenericLogDecorator.handlerMethodTrace(logTrace, start, logLevel, err);
        throw err;
      }
    };
    return descriptor;
  }
}
