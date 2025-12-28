import { Module } from '@nestjs/common';
import { CustomCacheModule } from 'src/common/cache/cache.module';
import { OrdersService } from './order.service';
import { OrdersController } from './order.controller';
import { PulsarModule } from 'src/events/pulsar/pulsar.module';

@Module({
  imports: [CustomCacheModule, PulsarModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderModule {}
