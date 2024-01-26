import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PushGateway } from './push.gateway';
import { PushService } from './push.service';

import { pushProviders } from 'src/repository/models/push.provider';
import { RepositoryModule } from 'src/repository/repository.module';

@Module({
  imports: [HttpModule, RepositoryModule],
  providers: [PushService, PushGateway, ...pushProviders],
})
export class PushModule {}
