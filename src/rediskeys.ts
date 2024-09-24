import {BindingKey} from '@loopback/core';
import {RedisConfig, RedisQueueOptions} from './redistypes';

export namespace RedisBindings {
  export const RedisClient = BindingKey.create<RedisConfig>('redis.client');
  export const ProducerFactory = BindingKey.create<
    (queueName: string) => () => Promise<void>
  >('redis.producer.factory');
  export const ConsumerConfiguration = BindingKey.create<
    Partial<RedisQueueOptions>
  >('redis.consumer.configuration');
}

export namespace RedisBindings {
  export const PRODUCER = 'redis.producer';
  export const CONSUMER = 'redis.consumer';
}
