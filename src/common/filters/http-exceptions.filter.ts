import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-redundant-type-constituents
      message = exception.getResponse() as string | any;

      if (typeof message === 'object') {
        // Check if 'message' property exists before accessing
        if (
          'message' in message &&
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          typeof (message as any).message === 'string'
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message = (message as any).message;
        } else {
          message = JSON.stringify(message);
        }
      }
    } else if (exception instanceof MongoError) {
      // Handle Mongo duplicate key error (code 11000)
      if (exception.code === 11000) {
        status = HttpStatus.BAD_REQUEST;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const key = Object.keys((exception as any).keyPattern)[0];
        message = `${key} already registered`;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
