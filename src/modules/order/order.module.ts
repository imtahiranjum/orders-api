import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomCacheModule } from "src/common/cache/cache.module";
import { PulsarModule } from "src/events/pulsar/pulsar.module";
import { OrdersEntity } from "./entities/order.entity";
import { OutboxEntity } from "./entities/outbox.entity";
import { OrdersController } from "./order.controller";
import { OrdersService } from "./order.service";

@Module({
  imports: [
    CustomCacheModule,
    PulsarModule,
    TypeOrmModule.forFeature([OrdersEntity, OutboxEntity]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderModule {}
