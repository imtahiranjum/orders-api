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
} from "@nestjs/common";
import { User } from "src/common/decorators/request-user.decorator";
import { type ReqUser } from "src/common/interfaces/auth.interfaces";
import { OrdersService } from "./order.service";

@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@User() reqUser: ReqUser, @Headers("idempotency-key") key: string) {
    if (!key) throw new BadRequestException("Missing Idempotency-Key");
    return this.ordersService.createDraft(reqUser.id, key);
  }

  @Patch(":id/confirm")
  confirm(
    @User() reqUser: ReqUser,
    @Param("id") id: string,
    @Headers("if-match") version: string,
    @Body() body: { totalCents: number }
  ) {
    return this.ordersService.confirm(
      id,
      reqUser.id,
      Number(version),
      body.totalCents
    );
  }

  @Post(":id/close")
  close(@User() reqUser: ReqUser, @Param("id") id: string) {
    return this.ordersService.close(id, reqUser.id);
  }

  @Get()
  list(
    @User() reqUser: ReqUser,
    @Query("limit") limit = 20,
    @Query("cursor") cursor?: string
  ) {
    return this.ordersService.list(
      reqUser.id,
      Math.min(limit, 100),
      cursor ? JSON.parse(Buffer.from(cursor, "base64").toString()) : undefined
    );
  }
}
