export interface ResponseLog {
  method: string;
  path: string;
  route: string;
  agent: string | undefined;
  ip: string;
  duration: number;
  statusCode: number;
  query: unknown;
  params: unknown;
  data?: any;
  headers?: any;
}
