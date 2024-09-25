import {inject, Provider} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Queue} from 'bullmq';
import {BullMqClientBindings} from '../bullmqkeys';
import {
  BullMqConfig,
  IStreamDefinitionBullMq,
  ProducerFactoryTypeBullMq,
} from '../bullmqtypes';
import {ErrorKeys} from '../error-keys';

/* A factory provider that creates a producer factory
   which sends messages to a BullMQ */
export class BullMqProducerFactoryProvider<T extends IStreamDefinitionBullMq>
  implements Provider<ProducerFactoryTypeBullMq<T>> {
  private queue: Queue;

  constructor(
    @inject(BullMqClientBindings.BullMqClient)
    private client: BullMqConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {
    this.queue = new Queue(this.client.queueName, {
      connection: this.client.connection,
    });
  }

  value(): ProducerFactoryTypeBullMq<T> {
    return () => {
      return {
        send: async <Type extends keyof T['messages']>(
          type: Type,
          payload: T['messages'][Type][],
        ): Promise<void> => {
          try {
            // Send all messages in parallel to BullMq
            await Promise.all(
              payload.map(async message => {
                const job = await this.queue.add(type as string, {
                  event: type,
                  data: message,
                });

                this.logger.info(`Message sent to BullMq queue with Job ID: ${job.id}`);
              }),
            );
          } catch (e) {
            this.logger.error(
              `${ErrorKeys.PublishFailed}: ${JSON.stringify(e)}`,
            );
            throw e;
          }
        },
      };
    };
  }
}
