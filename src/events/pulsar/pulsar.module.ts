import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PULSAR_CLIENT } from './constants/pulsar.constant';
import { PulsarClientService } from './pulsar-client.service';
import { PulsarProducerService } from './pulsar-producer.service';
import { Client } from 'pulsar-client';
import { PulsarEventPublisher } from './pulsar.publisher';
import { PulsarService } from './pulsar.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PULSAR_CLIENT,
      useFactory: (configService: ConfigService) =>
        new Client({
          serviceUrl: configService.getOrThrow('PULSAR_SERVICE_URL'),
        }),
      inject: [ConfigService],
    },
    PulsarProducerService,
    PulsarClientService,
    PulsarEventPublisher,
    PulsarService,
  ],
  exports: [PulsarProducerService, PulsarEventPublisher, PulsarService, PULSAR_CLIENT],
})
export class PulsarModule {}
