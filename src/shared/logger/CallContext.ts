import * as path from 'path';
import { CallerModuleInfo } from './types/caller.module.info.type';

/**
 * Represents a utility class for retrieving caller module information.
 */
export class CallContext {
  /**
   * Retrieves information about the caller module.
   * @param stackDepth The depth in the call stack to retrieve caller information from. Default is 2.
   * @returns An instance of CallerModuleInfo containing information about the caller module.
   */
  static getCallerModuleInfo(stackDepth: number = 2): CallerModuleInfo {
    // Creating an error to capture the stack trace
    const error = new Error();
    const originalPrepareStackTrace = Error.prepareStackTrace;

    // Capturing the call stack
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    Error.captureStackTrace(error, CallContext.getCallerModuleInfo);
    const callerStack = error.stack as unknown as NodeJS.CallSite[];

    // Parsing the call stack
    const caller = callerStack[stackDepth];
    const callerFilePath = caller.getFileName() || '';
    const callerDirname = path.dirname(callerFilePath);

    // Getting information about the caller module
    const callerModuleInfo: CallerModuleInfo = {
      name: path.basename(callerFilePath),
      filePath: callerFilePath,
      rootDir: path.dirname(callerDirname),
    };

    // Restoring the original prepareStackTrace function
    Error.prepareStackTrace = originalPrepareStackTrace;

    return callerModuleInfo;
  }
}
