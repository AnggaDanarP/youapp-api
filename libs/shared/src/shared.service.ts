import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { RabbitMQMessage } from './dto/rmq-event.dto';
import { RmqData } from './interfaces/rmq-data.interface';
import { Channel, Message } from 'amqplib';

@Injectable()
export class SharedService {
  extractData<T>(context: RmqContext): RmqData<T> {
    const channel: Channel = context.getChannelRef();
    const message = context.getMessage();
    const event = JSON.parse(
      message.content.toString(),
    ) as RabbitMQMessage<any>;
    return new RmqData<T>(channel, message as Message, event);
  }
}
