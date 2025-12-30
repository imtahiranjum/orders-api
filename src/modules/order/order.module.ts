import { Module } from '@nestjs/common';
import { CustomCacheModule } from 'src/common/cache/cache.module';
import { OrdersService } from './order.service';
import { OrdersController } from './order.controller';
import { PulsarModule } from 'src/events/pulsar/pulsar.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from './entities/order.entity';

@Module({
  imports: [CustomCacheModule, PulsarModule, TypeOrmModule.forFeature([OrdersEntity])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderModule {}
