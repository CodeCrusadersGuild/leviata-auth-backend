export interface ApiResponse<T> {
  statusCode: number;
  statusMessage: string;
  data: T;
  success: boolean;
}
