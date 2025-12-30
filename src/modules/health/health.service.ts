import { Injectable } from "@nestjs/common";
import { CacheService } from "src/common/cache/cache.service";
import { DataSource } from "typeorm";

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  checkHealth(): { status: string } {
    return { status: "ok" };
  }

  async checkReadiness() {
    const isDbInitialized = this.dataSource.manager.connection.isInitialized;
    const isCacheReachable = await this.cacheService.ping();

    return {
      status:
        isDbInitialized && isCacheReachable === "PONG" ? "ready" : "not_ready",
      checks: {
        database: isDbInitialized ? "up" : "down",
        cache: isCacheReachable === "PONG" ? "up" : "down",
      },
    };
  }
}
