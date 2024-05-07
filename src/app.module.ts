import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { redisStore } from 'cache-manager-redis-yet';

import { AppController } from './app.controller';
import { RepositoryModule } from './repository/repository.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WwwModule } from './www/www.module';
import { InviteModule } from './invite/invite.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    process.env.ENABLE_REDIS === '1'
      ? CacheModule.register({
          isGlobal: true,

          store: redisStore,
          url: process.env.REDIS_URI,
        })
      : CacheModule.register({
          isGlobal: true,
        }),
    RepositoryModule,
    DashboardModule,
    WwwModule,
    InviteModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
