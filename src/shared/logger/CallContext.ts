import * as path from 'path';
import { CallerModuleInfo } from './CallerModuleInfo';

export class CallContext {
  static getCallerModuleInfo(stackDepth: number = 2): CallerModuleInfo {
    const error = new Error();
    const originalPrepareStackTrace = Error.prepareStackTrace;

    // Capturando a pilha de chamadas
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    Error.captureStackTrace(error, CallContext.getCallerModuleInfo);
    const callerStack = error.stack as unknown as NodeJS.CallSite[];

    // Analisando a pilha de chamadas
    const caller = callerStack[stackDepth];
    const callerFilePath = caller.getFileName() || '';
    const callerDirname = path.dirname(callerFilePath);

    // Obtendo informações do módulo chamador
    const callerModuleInfo = new CallerModuleInfo(
      path.basename(callerFilePath),
      callerFilePath,
      path.dirname(callerDirname),
    );

    // Restaurando a função prepareStackTrace original
    Error.prepareStackTrace = originalPrepareStackTrace;

    return callerModuleInfo;
  }
}
