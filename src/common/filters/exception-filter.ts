import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logDir = path.join(__dirname, '../../../logs');
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor() {}

  private writeErrorLog(
    exception: any,
    request: Request,
    isUnhandled: boolean = false,
  ) {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      const filePath = path.join(
        this.logDir,
        isUnhandled ? 'unhandled-errors.log' : 'errors.log',
      );

      const logEntry = {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exception?.message,
        stack: exception?.stack,
        driverError: (exception as any)?.driverError || null,
      };

      fs.appendFileSync(filePath, JSON.stringify(logEntry, null, 2) + '\n');

      this.logger.error(
        isUnhandled ? 'Unhandled Error Logged' : 'Error Logged:',
        logEntry.message,
      );

      const formatted = [
        `\n`,
        `Timestamp: ${logEntry.timestamp}`,
        `Path: ${logEntry.path}`,
        `Method: ${logEntry.method}`,
        `Message: ${logEntry.message}`,
        `Stack:\n${logEntry.stack || 'N/A'}`,
        `Driver Error:\n${
          logEntry.driverError
            ? JSON.stringify(logEntry.driverError, null, 2)
            : 'None'
        }`,
        `\n`,
      ].join('\n');

      console.error(formatted);
    } catch (e) {
      console.error('Failed to write error log:', e);
    }
  }

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Default end-user response (translated)
    let userMessage = 'Internal Server Error';

    // Developer/system message (untranslated)
    let devMessage: string | object = exception?.message || 'Internal Error';

    // --- Handle known user-facing errors ---
    if (exception instanceof QueryFailedError) {
      const driverError: any = (exception as any).driverError;
      switch (driverError?.code) {
        case '23505': // Unique violation
          status = HttpStatus.CONFLICT;
          devMessage = exception.message;
          userMessage = 'Internal Server Error';
          break;
        case '23503': // Foreign key violation
          status = HttpStatus.BAD_REQUEST;
          devMessage = exception.message;
          userMessage = 'Internal Server Error';
          break;
        case '23502': // Missing required field
          status = HttpStatus.BAD_REQUEST;
          devMessage = exception.message;
          userMessage = 'Internal Server Error';
          break;
        case '22P02': // Invalid input syntax
          status = HttpStatus.BAD_REQUEST;
          devMessage = exception.message;
          userMessage = 'Internal Server Error';
          break;
        case '22003': // Out of range
          status = HttpStatus.BAD_REQUEST;
          devMessage = exception.message;
          userMessage = 'Internal Server Error';
          break;
        case '23514': // Check constraint
          status = HttpStatus.BAD_REQUEST;
          devMessage = exception.message;
          userMessage = 'Internal Server Error';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          userMessage = 'Internal Server Error';
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      devMessage = exception.message;
      userMessage = 'Not found';
    } else if (exception instanceof TypeORMError) {
      status = HttpStatus.BAD_REQUEST;
      devMessage = exception.message;
      userMessage = 'Internal Server Error';
    } else if (
      exception instanceof BadRequestException ||
      exception instanceof UnauthorizedException ||
      exception instanceof ForbiddenException ||
      exception instanceof NotFoundException ||
      exception instanceof HttpException
    ) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        userMessage = `errors.${res}`;
      } else {
        userMessage = (res as any)?.message || 'errors.general';
      }
    } else {
      this.writeErrorLog(exception, request, true);
    }

    this.writeErrorLog(exception, request, false);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: userMessage,
    });
  }
}
