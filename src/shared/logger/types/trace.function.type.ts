import { CallSite } from 'callsites';

export type TraceFunction = (err: Error, stack: CallSite[]) => any;
