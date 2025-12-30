import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/common/cache/cache.service';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
    constructor (
        private readonly dataSource: DataSource,
        private readonly cacheService: CacheService,
    ) { }

    checkHealth(): string {
        return 'OK';
    }

    checkReadiness(): string {
        // Check dependencies here (e.g., database, cache)
        return 'READY';
    }
}
