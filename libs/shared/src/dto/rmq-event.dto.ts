export interface RabbitMQMessage<T> {
  pattern: string;
  data: T;
  id: string;
}
