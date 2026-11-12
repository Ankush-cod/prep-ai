// src/utils/errors.ts
export class AppError extends Error {
  statusCode: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message, 400, 'BAD_REQUEST', fieldErrors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource was not found.') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message, 409, 'CONFLICT', fieldErrors);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}
