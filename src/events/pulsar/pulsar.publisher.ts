import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { getRequestId } from "src/common/middlewares/request-context";
import { PulsarEventEnvelope } from "./interfaces/pulsar.interface";
import { PulsarProducerService } from "./pulsar-producer.service";
import { PulsarService } from "./pulsar.service";

@Injectable()
export class PulsarEventPublisher {
  constructor(
    private readonly client: PulsarService,
    private readonly producer: PulsarProducerService
  ) {}

  async publish<T>(
    type: string,
    payload: T & { tenantId: string }
  ): Promise<void> {
    const envelope: PulsarEventEnvelope<T> = {
      id: randomUUID(),
      type,
      source: "orders-service",
      tenantId: payload.tenantId,
      time: new Date().toISOString(),
      schemaVersion: "1",
      traceId: getRequestId(),
      data: payload,
    };

    await this.client.publish(type, envelope);
    // await this.producer.produce(type, envelope);
  }
}
