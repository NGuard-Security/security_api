import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { ServersService } from 'src/dashboard/servers/servers.service'

import { WwwController } from './www.controller'
import { WwwService } from './www.service'

@Module({
  imports: [HttpModule],
  controllers: [WwwController],
  providers: [WwwService, ServersService],
})
export class WwwModule {}
