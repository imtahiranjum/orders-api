import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ReqUser } from "../interfaces/auth.interfaces";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ReqUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
