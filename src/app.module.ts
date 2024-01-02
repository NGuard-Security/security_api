import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import redisStore from 'cache-manager-ioredis';

import { AppController } from './app.controller';
import { RepositoryModule } from './repository/repository.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    process.env.ENABLE_REDIS === '1'
      ? CacheModule.register({
          store: redisStore,
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,

          isGlobal: true,
        })
      : CacheModule.register({
          isGlobal: true,
        }),
    RepositoryModule,
    DashboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
