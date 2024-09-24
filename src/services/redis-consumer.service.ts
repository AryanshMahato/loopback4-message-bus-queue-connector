import {inject} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {Job, Worker, WorkerOptions} from 'bullmq';
import Redis from 'ioredis';
import {RedisBindings} from '../rediskeys';
import {RedisMessage, RedisQueueOptions} from '../redistypes';

/* Service to consume messages from Redis */
export class RedisConsumerService {
  private worker: Worker;

  constructor(
    @inject(RedisBindings.CONSUMER) private queueOptions: RedisQueueOptions,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @inject('redis.connection') private readonly redisConnection: Redis,
  ) {
    const {queueName, concurrency} = this.queueOptions;

    // Ensure the connection is passed along with the concurrency option
    const workerOptions: WorkerOptions = {
      concurrency,
      connection: this.redisConnection, // Use Redis connection
    };

    this.worker = new Worker(
      queueName,
      async job => this.handleMessage(job),
      workerOptions,
    );

    this.logger.info(`Redis consumer initialized for queue: ${queueName}`);
  }

  async handleMessage(job: Job): Promise<void> {
    try {
      const message: RedisMessage = job.data;
      this.logger.debug(`Processing Redis message: ${JSON.stringify(message)}`);
      // Add your business logic here for processing the message

      this.logger.info(`Successfully processed job ID: ${job.id}`);
    } catch (error) {
      this.logger.error(`Error processing Redis message: ${error.message}`);
    }
  }

  async consume(): Promise<void> {
    this.worker.on('completed', job => {
      this.logger.info(`Job ${job.id} has been completed successfully.`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} has failed with error: ${err.message}`);
    });

    this.logger.info('Started consuming Redis messages.');
  }

  async stop(): Promise<void> {
    await this.worker.close();
    this.logger.info('Stopped Redis consumer.');
  }
}
