import {Provider, inject} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Queue} from 'bullmq';
import {RedisBindings} from '../rediskeys';
import {RedisQueueOptions} from '../redistypes';

/* Factory provider for Redis producer */
export class RedisProducerFactoryProvider implements Provider<Queue> {
  constructor(
    @inject(RedisBindings.PRODUCER) private queueOptions: RedisQueueOptions,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {}

  value(): Queue {
    const {queueName} = this.queueOptions;
    const queue = new Queue(queueName);

    this.logger.info(`Redis producer initialized for queue: ${queueName}`);
    return queue;
  }
}
