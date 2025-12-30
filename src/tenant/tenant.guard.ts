import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    if (!req.headers["x-tenant-id"]) {
      throw new BadRequestException("Missing X-Tenant-Id");
    }
    req.tenantId = req.headers["x-tenant-id"];
    return true;
  }
}
