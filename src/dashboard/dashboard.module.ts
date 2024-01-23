import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

import { SummaryController } from './summary/summary.controller';
import { SummaryService } from './summary/summary.service';

import { ServersController } from './servers/servers.controller';
import { ServersService } from './servers/servers.service';

import { MembersController } from './members/members.controller';
import { MembersService } from './members/members.service';

import { InviteController } from './invite/invite.controller';
import { InviteService } from './invite/invite.service';

import { VerifyController } from './verify/verify.controller';
import { VerifyService } from './verify/verify.service';

import { PushService } from './push/push.service';
import { PushGateway } from './push/push.gateway';

import { RepositoryModule } from 'src/repository/repository.module';

import { blacklistProviders } from 'src/repository/models/blacklist.providers';
import { usersProviders } from 'src/repository/models/users.providers';
import { settingsProviders } from 'src/repository/models/settings.providers';
import { enterpriseProviders } from 'src/repository/models/enterprise.providers';
import { verifyProviders } from 'src/repository/models/verify.providers';

@Module({
  imports: [HttpModule, RepositoryModule],
  controllers: [
    AuthController,
    SummaryController,
    ServersController,
    MembersController,
    InviteController,
    VerifyController,
  ],
  providers: [
    AuthService,
    SummaryService,
    ServersService,
    MembersService,
    InviteService,
    VerifyService,
    PushService,
    PushGateway,
    ...blacklistProviders,
    ...usersProviders,
    ...settingsProviders,
    ...enterpriseProviders,
    ...verifyProviders,
  ],
})
export class DashboardModule {}
