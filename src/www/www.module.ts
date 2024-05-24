import { Module } from '@nestjs/common';

import { WwwController } from './www.controller';
import { WwwService } from './www.service';

@Module({
  imports: [],
  controllers: [WwwController],
  providers: [WwwService],
})
export class WwwModule {}
