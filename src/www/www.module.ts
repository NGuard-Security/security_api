import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WwwController } from './www.controller';
import { WwwService } from './www.service';

@Module({
  imports: [HttpModule],
  controllers: [WwwController],
  providers: [WwwService],
})
export class WwwModule {}
