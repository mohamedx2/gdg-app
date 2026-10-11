/**
 * Errors thrown by route handlers. The status + message are surfaced to the
 * client verbatim, so keep messages user-friendly (the app displays them).
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }

  static badRequest(message = 'That request could not be completed.') {
    return new HttpError(400, message);
  }

  static unauthorized(message = 'Your session expired. Please sign in again.') {
    return new HttpError(401, message);
  }

  static forbidden(message = 'You do not have access to do that.') {
    return new HttpError(403, message);
  }

  static notFound(message = 'We could not find what you were looking for.') {
    return new HttpError(404, message);
  }

  static conflict(message = 'That action conflicts with the current state.') {
    return new HttpError(409, message);
  }

  static server(message = 'Something went wrong. Please try again.') {
    return new HttpError(500, message);
  }
}
