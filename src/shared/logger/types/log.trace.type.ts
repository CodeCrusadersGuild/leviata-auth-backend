export interface LogTrace {
  action: string;
  method: string;
  class: string;
  function: string;
  parameters?: any;
  hasFailed?: boolean;
  duration?: number;
  errorMessage?: unknown;
}
