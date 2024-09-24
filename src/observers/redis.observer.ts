import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service,
} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {RedisConsumerService} from '../services';

/* LifeCycleObserver to start and stop Redis Consumer */
@lifeCycleObserver()
export class RedisObserver implements LifeCycleObserver {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(RedisConsumerService) private consumer: RedisConsumerService,
  ) {}

  async start(): Promise<void> {
    await this.consumer.consume();
    this.logger.debug('Redis Observer has started.');
  }

  async stop(): Promise<void> {
    await this.consumer.stop();
    this.logger.debug('Redis Observer has stopped!');
  }
}
