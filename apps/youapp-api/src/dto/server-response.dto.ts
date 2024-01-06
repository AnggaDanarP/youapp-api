export class ServerResponse<T> {
  readonly isOk!: boolean;
  readonly message?: string;
  readonly errorCode?: number;
  data?: T;
}
