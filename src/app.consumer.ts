import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'pulsar-client';
import { ORDERS } from './app.constants';
import { PULSAR_CLIENT } from './events/pulsar/constants/pulsar.constant';
import { PulsarConsumer } from './events/pulsar/pulsar.consumer';

@Injectable()
export class AppConsumer extends PulsarConsumer<any> {
  constructor(@Inject(PULSAR_CLIENT) pulsarClient: Client) {
    super(pulsarClient, {
      topic: ORDERS,
      subscriptionType: 'Shared',
      subscription: 'nestjs-shared',
    });
  }

  protected handleMessage(data: any) {
    this.logger.log('New message in AppConsumer.', data);
  }
}
