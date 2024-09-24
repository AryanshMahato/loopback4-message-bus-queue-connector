export interface RedisMessage {
  data: any;
  id: string;
  timestamp: number;
}

export interface RedisQueueOptions {
  queueName: string;
  concurrency?: number;
}

export interface RedisConfig {
  queues: string[];
}
