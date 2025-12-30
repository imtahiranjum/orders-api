import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { CacheService } from "src/common/cache/cache.service";
import { PulsarEventPublisher } from "src/events/pulsar/pulsar.publisher";
import { DataSource } from "typeorm";
import { OrdersEntity } from "./entities/order.entity";
import { OutboxEntity } from "./entities/outbox.entity";
import { OrderStatus } from "./enums/order-status.enum";

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private cacheService: CacheService,
    private events: PulsarEventPublisher,
  ) {}

  async createDraft(userId: string, idemKey: string) {
    const redisKey = `${userId}:${idemKey}`;

    const cached = await this.cacheService.get(redisKey);
    if (cached) return cached;

    const order = this.dataSource.manager.create(OrdersEntity, {
      userId,
      status: OrderStatus.DRAFT,
    });

    await this.dataSource.manager.save(order);

    const response = {
      id: order.id,
      userId,
      status: order.status,
      version: order.version,
      createdAt: order.createdAt,
    };

    await this.events.publish("orders.created", response);
    await this.cacheService.set(redisKey, response);

    return response;
  }

  async confirm(
    id: string,
    userId: string,
    version: number,
    totalCents: number,
  ) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(OrdersEntity)
      .set({
        status: OrderStatus.CONFIRMED,
        totalCents,
        version: () => "version + 1",
      })
      .where("id = :id AND userId = :userId AND version = :version", {
        id,
        userId,
        version,
      })
      .execute();

    if (!result.affected) {
      throw new ConflictException("Stale version");
    }

    await this.events.publish("orders.confirmed", { id, userId });
  }

  async close(id: string, userId: string) {
    await this.dataSource.transaction(async (em) => {
      const order = await em.findOneBy(OrdersEntity, { id, userId: userId });

      if (!order || order.status !== "confirmed") {
        throw new BadRequestException("Invalid order state");
      }

      order.status = OrderStatus.CLOSED;
      order.version += 1;
      await em.save(order);

      await em.insert(OutboxEntity, {
        eventType: "orders.closed",
        orderId: order.id,
        userId,
        payload: {
          orderId: order.id,
          userId,
          totalCents: order.totalCents as number,
          closedAt: new Date().toISOString(),
        },
      });
    });
  }

  async list(userId: string, limit: number, cursor?: any) {
    const qb = this.dataSource
      .getRepository(OrdersEntity)
      .createQueryBuilder("o")
      .where("o.userId = :userId", { userId })
      .orderBy("o.createdAt", "DESC")
      .addOrderBy("o.id", "DESC")
      .take(limit + 1);

    if (cursor) {
      qb.andWhere("(o.createdAt, o.id) < (:createdAt, :id)", cursor);
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);

    return {
      items,
      nextCursor: hasMore
        ? Buffer.from(
            JSON.stringify({
              createdAt: items[items.length - 1].createdAt,
              id: items[items.length - 1].id,
            }),
          ).toString("base64")
        : null,
    };
  }
}
