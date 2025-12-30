import { createParamDecorator } from "@nestjs/common";

export const Tenant = createParamDecorator(
  (_, ctx) => ctx.switchToHttp().getRequest().tenantId,
);
