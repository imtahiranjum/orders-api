import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express"; // eslint-disable-line

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message: any = exception.getResponse(); // eslint-disable-line

    //TODO: Add error logging here
    const logging = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message.message || exception.message,
      // method: request.method,
      // IP: request.ip,
      // user: request['user']['id'],
      // payload: request['body'],
    };

    response.status(status).json(logging);
  }
}
