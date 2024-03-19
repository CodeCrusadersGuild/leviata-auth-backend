import { CallSite } from 'callsites';
import { OriginFunction } from './types/origin.function.type';

export class StackTrace {
  private static originalLimit = Error.stackTraceLimit;
  private static originalTrace = Error.prepareStackTrace;

  /**
   * Retrieves call sites from the stack trace.
   * @param frames The number of frames to retrieve.
   * @param origin The origin function for the stack trace. Defaults to the current function.
   * @returns A promise that resolves to an array of call sites.
   */
  static async getCallsites(
    frames: number,
    origin?: OriginFunction,
  ): Promise<CallSite[]> {
    origin = origin || StackTrace.getCallsites;
    frames = Math.abs(Math.floor(frames)) || 1;
    origin = typeof origin === 'function' && origin;

    StackTrace.configureStackTrace(frames, origin);

    const stack = await StackTrace.captureStackTrace(origin);

    StackTrace.restoreOriginalStackTrace();

    return stack;
  }

  /**
   * Configures the stack trace limit and trace function.
   * @param frames The number of frames.
   * @param origin The origin function for the stack trace.
   */
  private static configureStackTrace(
    frames: number,
    origin?: OriginFunction,
  ): void {
    Error.stackTraceLimit = origin ? frames : frames + 1;
    Error.prepareStackTrace = (_, stack) => stack;
  }

  /**
   * Captures the stack trace.
   * @param origin The origin function for the stack trace.
   * @returns A promise that resolves to an array of call sites.
   */
  private static async captureStackTrace(
    origin: OriginFunction | undefined,
  ): Promise<CallSite[]> {
    const error = new Error();
    Error.captureStackTrace(error, origin || StackTrace.getCallsites);
    const stack = origin ? error.stack : error.stack.slice(1);
    return stack as unknown as CallSite[];
  }

  /**
   * Restores the original stack trace limit and trace function.
   */
  private static restoreOriginalStackTrace(): void {
    Error.stackTraceLimit = StackTrace.originalLimit;
    Error.prepareStackTrace = StackTrace.originalTrace;
  }
}
