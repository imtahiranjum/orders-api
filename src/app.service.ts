import { Injectable } from "@nestjs/common";
import { PulsarProducerService } from "./events/pulsar/pulsar-producer.service";
import { ORDERS } from "./app.constants";

@Injectable()
export class AppService {
  constructor(private readonly pulsarProducerService: PulsarProducerService) {}

  async sendMessage(request: any) {
    for (let i = 0; i <= 1000; i++) {
      await this.pulsarProducerService.produce(ORDERS, request);
    }
  }

  getHello(): string {
    return "Hello World!";
  }
}
