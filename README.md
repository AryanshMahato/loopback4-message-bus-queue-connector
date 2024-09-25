# Message bus queue connectors
This is the package for the message bus queue connectors component for LoopBack 4 applications.
It provides components to work with queues such as SQS, Redis(NodeBull)

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install MessageBusQueueConnectorsComponent using `npm`;

```sh
$ [npm install | yarn add] message-bus-queue-connectors
```

## Basic Use

Configure and load MessageBusQueueConnectorsComponent in the application constructor
as shown below.

### SQS
```ts
import {MessageBusQueueConnectorsComponent, MessageBusQueueConnectorsComponentOptions, DEFAULT_MESSAGE_BUS_QUEUE_CONNECTORS_OPTIONS} from 'message-bus-queue-connectors';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.bind(SqsClientBindings.SqsClient).to(
      options.sqsConfig
    );

    this.component(MessageBusQueueConnectorsComponent);
    // ...
  }
  // ...
}
```

#### SQS Config
```ts
const config = {
  initObservers: true,
  clientConfig: {
    region: "aws-region",
    credentials: {
      accessKeyId: "aws-access-key-id",
      secretAccessKey: "aws-secret-access-key",
    },
    maxAttempts: 3, // Maximum number of attempts to retry
    retryMode: 'standard', // Retry mode, standard or exponential
  },
  queueUrl: "sqs-queue-url",
  groupId: "group-ids",
  maxNumberOfMessages: "max-number-of-messages",
  waitTimeSeconds: "??",
  topics: [/*supported topics*/],
}
```
Please follow the [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html) for more information on the configuration.


### BullMq
```ts
import {MessageBusQueueConnectorsComponent, MessageBusQueueConnectorsComponentOptions, DEFAULT_MESSAGE_BUS_QUEUE_CONNECTORS_OPTIONS} from 'message-bus-queue-connectors';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.bind(BullMqClientBindings.BullMqClient).to(
      options.bullMqConfig
    );

    this.component(MessageBusQueueConnectorsComponent);
    // ...
  }
  // ...
}
```

#### BullMq Config
```ts
const config = {
  initObservers: true,
  queueName: 'queue-name', // Name of the queue
  connection: {
    host: 'redis-host', // Redis host
    port: 6379,         // Redis port
    password: 'redis-password', // Optional, if Redis is password-protected
    db: 0,              // Redis DB (optional)
  },
  defaultJobOptions: {
    removeOnComplete: true,  // Remove job from queue when completed
    attempts: 3,             // Retry attempts for a failed job
    backoff: { type: 'exponential', delay: 5000 }, // Optional backoff strategy
  },
  topics: [/* Supported topics */],
};

```
Please follow the [BullMq for NestJS](https://docs.nestjs.com/techniques/queues) for more information on the configuration.

## Produce and consume SQS event
Topic: `topicTransform` <br />
Event: `QueueEvent.Transform` <br />

#### Consumer setup
```ts
import {asConsumer, EventsInStream, IConsumer} from '@sourceloop/queue';

@injectable(asConsumer)
export class MyQueueConsumerService
  implements IConsumer<SqsTransformStream, EventsInStream<SqsTransformStream>>
{
  // register consumer for particular topic
  topic: string = topicTransform;
  // register consumer for particular event
  event: EventsInStream<SqsTransformStream> = QueueEvent.Transform;

  async handler(payload: AnyObject) {
    // handle your queue payload here
  }
}

```

#### Producer setup
```ts
@injectable({scope: BindingScope.TRANSIENT})
export class ProducerService {
  constructor(
    @producer(topicTransform)
    private readonly sqsProducer?: Producer<SqsTransformStream>,
  ) {}

  async extract() {
    await this.sqsProducer.send(QueueEvent.Transform, [/*Payload...*/]);
  }
}
```

## Produce and consume BullMQ event
Topic: `topicTransform` <br />
Event: `QueueEvent.Transform` <br />

#### Consumer setup
```ts
import {asConsumer, EventsInStream, IConsumer} from '@sourceloop/queue';

@injectable(asConsumer)
export class MyQueueConsumerService
  implements IConsumer<BullMqTransformStream, EventsInStream<BullMQTransformStream>>
{
  // register consumer for particular topic
  topic: string = topicTransform;
  // register consumer for particular event
  event: EventsInStream<BullMQTransformStream> = QueueEvent.Transform;

  async handler(payload: AnyObject) {
    // handle your queue payload here
  }
}

```

#### Producer setup
```ts
@injectable({scope: BindingScope.TRANSIENT})
export class ProducerService {
  constructor(
    @producer(topicTransform)
    private readonly bullMQProducer?: Producer<BullMQTransformStream>,
  ) {}

  async extract() {
    await this.sqsProducer.send(QueueEvent.Transform, [/*Payload...*/]);
  }
}
```
