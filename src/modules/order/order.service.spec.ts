import { BadRequestException, ConflictException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CacheService } from "src/common/cache/cache.service";
import { PulsarEventPublisher } from "src/events/pulsar/pulsar.publisher";
import { DataSource } from "typeorm";
import { OrdersEntity } from "./entities/order.entity";
import { OutboxEntity } from "./entities/outbox.entity";
import { OrderStatus } from "./enums/order-status.enum";
import { OrdersService } from "./order.service";

describe("OrdersService", () => {
  let service: OrdersService;

  const mockManager = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    insert: jest.fn(),
  };

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockDataSource = {
    manager: mockManager,
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    getRepository: jest.fn(() => ({
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    })),
    transaction: jest.fn(async (cb) => cb(mockManager)),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockEvents = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: CacheService, useValue: mockCacheService },
        { provide: PulsarEventPublisher, useValue: mockEvents },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  describe("createDraft", () => {
    it("returns cached response if idempotency key exists", async () => {
      const cached = { id: "order-1" };
      mockCacheService.get.mockResolvedValue(cached);

      const result = await service.createDraft("user-1", "key-1");

      expect(result).toBe(cached);
      expect(mockManager.save).not.toHaveBeenCalled();
    });

    it("creates and caches a new draft order", async () => {
      const order = {
        id: "order-1",
        status: OrderStatus.DRAFT,
        version: 1,
        createdAt: new Date(),
      };

      mockCacheService.get.mockResolvedValue(null);
      mockManager.create.mockReturnValue(order);
      mockManager.save.mockResolvedValue(order);

      const result: any = await service.createDraft("user-1", "key-1");

      expect(mockManager.create).toHaveBeenCalledWith(OrdersEntity, {
        userId: "user-1",
        status: OrderStatus.DRAFT,
      });

      expect(mockEvents.publish).toHaveBeenCalledWith(
        "orders.created",
        expect.objectContaining({ id: order.id })
      );

      expect(mockCacheService.set).toHaveBeenCalled();
      expect(result.id).toBe(order.id);
    });
  });

  describe("confirm", () => {
    it("throws ConflictException on stale version", async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });

      await expect(
        service.confirm("order-1", "user-1", 1, 500)
      ).rejects.toThrow(ConflictException);
    });

    it("confirms order and publishes event", async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });

      await service.confirm("order-1", "user-1", 1, 500);

      expect(mockEvents.publish).toHaveBeenCalledWith("orders.confirmed", {
        id: "order-1",
        userId: "user-1",
      });
    });
  });

  describe("close", () => {
    it("throws if order is not confirmed", async () => {
      mockManager.findOneBy.mockResolvedValue({
        status: OrderStatus.DRAFT,
      });

      await expect(service.close("order-1", "user-1")).rejects.toThrow(
        BadRequestException
      );
    });

    it("closes order and inserts outbox event", async () => {
      const order = {
        id: "order-1",
        userId: "user-1",
        status: OrderStatus.CONFIRMED,
        version: 1,
        totalCents: 500,
      };

      mockManager.findOneBy.mockResolvedValue(order);

      await service.close("order-1", "user-1");

      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OrderStatus.CLOSED,
          version: 2,
        })
      );

      expect(mockManager.insert).toHaveBeenCalledWith(
        OutboxEntity,
        expect.objectContaining({
          eventType: "orders.closed",
          orderId: "order-1",
        })
      );
    });
  });

  describe("list", () => {
    it("returns items with nextCursor", async () => {
      const rows = [
        { id: "3", createdAt: new Date("2024-01-03") },
        { id: "2", createdAt: new Date("2024-01-02") },
        { id: "1", createdAt: new Date("2024-01-01") },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(rows);

      const result = await service.list("user-1", 2);

      expect(result.items.length).toBe(2);
      expect(result.nextCursor).toBeDefined();
    });
  });
});
