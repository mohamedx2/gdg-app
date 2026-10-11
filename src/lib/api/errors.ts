export type ApiErrorKind = 'network' | 'timeout' | 'auth' | 'not_found' | 'validation' | 'server' | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind = 'unknown', status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }

  static network(message = 'You are offline. Check your connection and try again.'): ApiError {
    return new ApiError(message, 'network');
  }

  static timeout(message = 'The request took too long. Please try again.'): ApiError {
    return new ApiError(message, 'timeout');
  }

  static unauthorized(message = 'Your session expired. Please sign in again.'): ApiError {
    return new ApiError(message, 'auth', 401);
  }

  static notFound(message = 'We could not find what you were looking for.'): ApiError {
    return new ApiError(message, 'not_found', 404);
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) {
    if (error.name === 'AbortError') return ApiError.timeout();
    if (error.message === 'Network request failed') return ApiError.network();
    return new ApiError(error.message, 'unknown');
  }
  return new ApiError('Something went wrong. Please try again.', 'unknown');
}
