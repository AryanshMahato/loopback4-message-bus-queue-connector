import {extensionPoint, extensions, Getter, inject} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Queue, QueueOptions, Worker} from 'bullmq';
import {BullMqClientBindings, ConsumerExtensionPointBullMq} from '../bullmqkeys';
import {BullMqConfig, IConsumerBullMq} from '../bullmqtypes';

@extensionPoint(ConsumerExtensionPointBullMq.key)
export class BullMqConsumerService {
  private worker: Worker | undefined;

  constructor(
    @inject(BullMqClientBindings.BullMqClient) private config: BullMqConfig,
    @extensions() private getConsumers: Getter<IConsumerBullMq<any, any>[]>,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) { }

  async consume(): Promise<void> {
    const queueOptions: QueueOptions = {
      connection: this.config.connection,
      defaultJobOptions: this.config.defaultJobOptions, // Example of added queue options
    };

    const queue = new Queue(this.config.queueName, queueOptions);

    const consumers = await this.getConsumers();
    const consumerMap = new Map<string, IConsumerBullMq<any, any>>();
    consumers.forEach(consumer => {
      if (consumer.event) {
        consumerMap.set(consumer.event, consumer);
      } else {
        throw new Error(`Consumer missing event type: ${JSON.stringify(consumer)}`);
      }
    });

    this.worker = new Worker(this.config.queueName, async job => {
      const consumer = consumerMap.get(job.name);
      if (consumer) {
        await consumer.handler(job.data);
        this.logger.info(`Successfully processed job: ${job.id}`);
      } else {
        this.logger.warn(`Unhandled event: ${job.name}`);
      }
    }, {connection: this.config.connection});
  }

  async stop() {
    if (this.worker) {
      await this.worker.close();
      this.logger.debug('BullMq Consumer service has stopped.');
    }
  }
}
