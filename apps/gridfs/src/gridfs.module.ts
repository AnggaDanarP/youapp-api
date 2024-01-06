import { Module } from '@nestjs/common';
import { GridfsController } from './gridfs.controller';
import { GridfsService } from './gridfs.service';
import { SharedModule } from '@app/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GridfsController],
  providers: [GridfsService],
})
export class GridfsModule {}
