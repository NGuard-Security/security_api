import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'

import { createKeyv } from '@keyv/redis'

import { AppController } from './app.controller'
import { RepositoryModule } from './repository/repository.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { WwwModule } from './www/www.module'
import { InviteModule } from './invite/invite.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    process.env.ENABLE_REDIS === '1'
      ? CacheModule.registerAsync({
          useFactory: async (configService: ConfigService) => ({
            stores: [createKeyv(configService.getOrThrow('REDIS_URI'))],
          }),
          inject: [ConfigService],
          isGlobal: true,
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
