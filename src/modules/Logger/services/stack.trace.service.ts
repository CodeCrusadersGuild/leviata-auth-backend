import { Injectable } from '@nestjs/common';
import { CallSite } from 'callsites';

type OriginFunction = (...args: any[]) => any;
type TraceFunction = (err: Error, stack: CallSite[]) => any;

@Injectable()
export class StackTraceService {
  private originalLimit: number;
  private originalTrace: TraceFunction;

  constructor() {
    this.originalLimit = Error.stackTraceLimit;
    this.originalTrace = Error.prepareStackTrace;
  }

  /**
   * Retrieves call sites from the stack trace.
   * @param frames The number of frames to retrieve.
   * @param origin The origin function for the stack trace. Defaults to the current function.
   * @returns A promise that resolves to an array of call sites.
   */
  async getCallsites(
    frames: number,
    origin?: OriginFunction,
  ): Promise<CallSite[]> {
    // Set default values if parameters are not provided
    origin = origin || this.getCallsites;
    frames = Math.abs(Math.floor(frames)) || 1;
    origin = typeof origin === 'function' && origin;

    // Configure stack trace limit and trace function
    Error.stackTraceLimit = origin ? frames : frames + 1;
    Error.prepareStackTrace = (_, stack) => stack;

    // Capture stack trace
    const error = new Error();
    Error.captureStackTrace(error, origin || this.getCallsites);
    const stack = origin ? error.stack : error.stack.slice(1);

    // Restore original stack trace limit and trace function
    Error.stackTraceLimit = this.originalLimit;
    Error.prepareStackTrace = this.originalTrace;

    // Return the stack as call sites
    return stack as unknown as CallSite[];
  }
}
