import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Tenant } from 'src/tenant/tenant.decorator';
import { TenantGuard } from 'src/tenant/tenant.guard';
import { OrdersService } from './order.service';

@UseGuards(TenantGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Tenant() tenantId: string, @Headers('idempotency-key') key: string) {
    if (!key) throw new BadRequestException('Missing Idempotency-Key');
    return this.ordersService.createDraft(tenantId, key);
  }

  @Patch(':id/confirm')
  confirm(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Headers('if-match') version: string,
    @Body() body: { totalCents: number },
  ) {
    return this.ordersService.confirm(id, tenantId, Number(version), body.totalCents);
  }

  @Post(':id/close')
  close(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.close(id, tenantId);
  }

  @Get()
  list(
    @Tenant() tenantId: string,
    @Query('limit') limit = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.ordersService.list(
      tenantId,
      Math.min(limit, 100),
      cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString()) : undefined,
    );
  }
}
