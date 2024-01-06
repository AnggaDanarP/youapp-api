import { Channel, Message } from 'amqplib';
import { RabbitMQMessage } from '../dto/rmq-event.dto';

interface IRmqData<T> {
  channel: Channel;
  message: Message;
  event: RabbitMQMessage<T>;
}

export class RmqData<T> implements IRmqData<T> {
  channel: Channel;
  message: Message;
  event: RabbitMQMessage<T>;

  constructor(channel: Channel, message: Message, event: RabbitMQMessage<T>) {
    this.channel = channel;
    this.message = message;
    this.event = event;
  }

  nack(): void {
    this.channel.nack(this.message);
  }

  ack(): void {
    this.channel.ack(this.message);
  }

  get data(): T {
    return this.event.data;
  }
}
