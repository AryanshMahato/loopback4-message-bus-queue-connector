import {inject, lifeCycleObserver, LifeCycleObserver, service} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {BullMqConsumerService} from '../services';

/* It's a LifeCycleObserver that starts the BullMqConsumerService
   when the application starts and stops it when the application stops */
@lifeCycleObserver()
export class BullMqObserver implements LifeCycleObserver {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(BullMqConsumerService) private consumer: BullMqConsumerService,
  ) { }

  async start(): Promise<void> {
    await this.consumer.consume();
    this.logger.debug('BullMq Observer has started.');
  }

  async stop(): Promise<void> {
    await this.consumer.stop();
    this.logger.debug('BullMq Observer has stopped!');
  }
}
