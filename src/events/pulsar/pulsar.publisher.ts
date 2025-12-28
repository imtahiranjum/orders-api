import { Injectable } from '@nestjs/common';
import { getRequestId } from 'src/common/middlewares/request-context';
import { PulsarEventEnvelope } from './interfaces/pulsar.interface';
import { PulsarService } from './pulsar.service';
import { randomUUID } from 'crypto';


@Injectable()
export class PulsarEventPublisher {
  constructor(private readonly client: PulsarService) {}

  async publish<T>(
    type: string,
    payload: T & { tenantId: string },
  ): Promise<void> {
    const envelope: PulsarEventEnvelope<T> = {
      id: randomUUID(),
      type,
      source: 'orders-service',
      tenantId: payload.tenantId,
      time: new Date().toISOString(),
      schemaVersion: '1',
      traceId: getRequestId(),
      data: payload,
    };

    await this.client.publish(type, envelope);
  }
}
