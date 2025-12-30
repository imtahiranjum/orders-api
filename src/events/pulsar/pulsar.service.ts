import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class PulsarService {
  private readonly logger = new Logger("Pulsar");

  async publish(topic: string, message: any): Promise<void> {
    this.logger.log(
      `Event published for topic "${topic}" → ${JSON.stringify(message)}`,
    );

    return Promise.resolve();
  }
}
