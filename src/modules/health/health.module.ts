import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { CustomCacheModule } from 'src/common/cache/cache.module';

@Module({
  imports: [CustomCacheModule],
  controllers: [HealthController],
  providers: [HealthService]
})
export class HealthModule {}
