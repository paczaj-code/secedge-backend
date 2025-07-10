import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

/**
 * GlobalExceptionFilter is a custom exception filter that handles all uncaught
 * exceptions in the application. It intercepts exceptions and structures the
 * error response in a uniform format.
 *
 * This filter is designed to handle both HTTP exceptions and unknown exceptions.
 * If the exception is an instance of HttpException, the appropriate status code
 * and message are retrieved from the exception. For unknown exceptions, a default
 * status code of 500 and a message of "Internal server error" are used.
 *
 * The structured JSON response includes:
 * - `statusCode`: The HTTP status code for the error.
 * - `timestamp`: The ISO string representation of the time the error occurred.
 * - `path`: The URL path of the request when the error occurred.
 * - `message`: A description of the error.
 *
 * Implements the `ExceptionFilter` interface provided by NestJS.
 *
 * Decorated with the `@Catch()` decorator to indicate that it catches exceptions.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
