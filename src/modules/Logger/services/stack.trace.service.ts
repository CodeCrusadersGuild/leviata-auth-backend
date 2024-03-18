import { Injectable } from '@nestjs/common';
import { CallSite } from 'callsites';
import { TraceFunction } from '../types/trace.function.type';
import { OriginFunction } from '../types/origin.function.type';

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
    origin = origin || this.getCallsites;
    frames = Math.abs(Math.floor(frames)) || 1;
    origin = typeof origin === 'function' && origin;

    this.configureStackTrace(frames, origin);

    const stack = await this.captureStackTrace(origin);

    this.restoreOriginalStackTrace();

    return stack;
  }

  /**
   * Configures the stack trace limit and trace function.
   * @param frames The number of frames.
   * @param origin The origin function for the stack trace.
   */
  private configureStackTrace(frames: number, origin?: OriginFunction): void {
    Error.stackTraceLimit = origin ? frames : frames + 1;
    Error.prepareStackTrace = (_, stack) => stack;
  }

  /**
   * Captures the stack trace.
   * @param origin The origin function for the stack trace.
   * @returns A promise that resolves to an array of call sites.
   */
  private async captureStackTrace(
    origin: OriginFunction | undefined,
  ): Promise<CallSite[]> {
    const error = new Error();
    Error.captureStackTrace(error, origin || this.getCallsites);
    const stack = origin ? error.stack : error.stack.slice(1);
    return stack as unknown as CallSite[];
  }

  /**
   * Restores the original stack trace limit and trace function.
   */
  private restoreOriginalStackTrace(): void {
    Error.stackTraceLimit = this.originalLimit;
    Error.prepareStackTrace = this.originalTrace;
  }
}
