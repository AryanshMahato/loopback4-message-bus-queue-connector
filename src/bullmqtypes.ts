import {JobsOptions} from 'bullmq';
import {RedisOptions} from 'ioredis';

export interface BullMqConfig {
  queueName: string;
  connection: RedisOptions;
  defaultJobOptions?: JobsOptions;
}

export interface IConsumerBullMq<TInput, TOutput> {
  event: string;
  handler(data: TInput): Promise<TOutput>;
}

export interface IStreamDefinitionBullMq {
  messages: {
    [key: string]: any;
  };
}

export type ProducerFactoryTypeBullMq<T extends IStreamDefinitionBullMq> = () => {
  send<Type extends keyof T['messages']>(
    type: Type,
    payload: T['messages'][Type][],
  ): Promise<void>;
};
