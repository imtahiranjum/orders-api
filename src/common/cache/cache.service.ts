import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cache.get<T>(key);
    } catch (err) {
      this.logger.error(`Failed to get cache for key ${key}`, err.stack);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttlSeconds ?? 0);
    } catch (err) {
      this.logger.error(`Failed to set cache for key ${key}`, err.stack);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (err) {
      this.logger.error(`Failed to delete cache for key ${key}`, err.stack);
    }
  }

  async clear(): Promise<void> {
    await this.cache.clear?.();
  }
}
