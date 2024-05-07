import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

import { RepositoryModule } from 'src/repository/repository.module';
import { settingsProviders } from 'src/repository/models/settings.providers';

@Module({
  imports: [HttpModule, RepositoryModule],
  controllers: [InviteController],
  providers: [InviteService, ...settingsProviders],
})
export class InviteModule {}
