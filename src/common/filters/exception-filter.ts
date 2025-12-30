import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { EntityNotFoundError, QueryFailedError, TypeORMError } from "typeorm";

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly logDir = path.join(process.cwd(), "logs");

  private readonly dbErrorMap: Record<
    string,
    { status: HttpStatus; message: string }
  > = {
    "23505": {
      status: HttpStatus.CONFLICT,
      message: "Resource already exists",
    },
    "23503": { status: HttpStatus.BAD_REQUEST, message: "Invalid reference" },
    "23502": {
      status: HttpStatus.BAD_REQUEST,
      message: "Missing required field",
    },
    "22P02": {
      status: HttpStatus.BAD_REQUEST,
      message: "Invalid input format",
    },
    "22003": { status: HttpStatus.BAD_REQUEST, message: "Value out of range" },
    "23514": {
      status: HttpStatus.BAD_REQUEST,
      message: "Constraint violation",
    },
  };

  private logError(exception: unknown, request: Request) {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }

      const log = {
        timestamp: new Date().toISOString(),
        method: request.method,
        path: request.url,
        message: (exception as any)?.message,
        stack: (exception as any)?.stack,
        driverError: (exception as any)?.driverError ?? null,
      };

      fs.appendFileSync(
        path.join(this.logDir, "errors.log"),
        JSON.stringify(log) + "\n",
      );

      this.logger.error(log.message);
    } catch (err) {
      console.error("Failed to write error log", err);
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      message =
        typeof res === "string" ? res : ((res as any)?.message ?? message);
    } else if (exception instanceof QueryFailedError) {
      const code = (exception as any)?.driverError?.code;
      const mapped = this.dbErrorMap[code];

      status = mapped?.status ?? HttpStatus.BAD_REQUEST;
      message = mapped?.message ?? "Database error";
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = "Resource not found";
    } else if (exception instanceof TypeORMError) {
      status = HttpStatus.BAD_REQUEST;
      message = "Database operation failed";
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
    }

    this.logError(exception, request);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
