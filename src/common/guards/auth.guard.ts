import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { verify } from "jsonwebtoken";
import { UsersService } from "src/modules/users/users.service";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const payload: any = verify(
        token,
        this.configService.get<string>("JWT_SECRET")!,
      );

      const user = await this.usersService.findOne(payload.id);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      request.user = payload;
      if (request.method === "POST") {
        request.body = { ...request.body, createdBy: user.id };
      } else if (request.method === "PATCH" || request.method === "PUT") {
        request.body = {
          ...request.body,
          updatedBy: user.id,
        };
      } else if (request.method === "DELETE") {
        request.body = { ...request.body, deletedBy: user.id };
      }
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException("Invalid or expired token");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
