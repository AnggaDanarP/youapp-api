import { NestFactory } from '@nestjs/core';
import { GridfsModule } from './gridfs.module';
import { ConfigService } from '@nestjs/config/dist/config.service';

async function bootstrap() {
  const app = await NestFactory.create(GridfsModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.get('GRIDFS_PORT') as number);
}
bootstrap();
