import { Module } from '@nestjs/common';

import { StatusController } from './status/status.controller';
import { StatusService } from './status/status.service';

@Module({
  imports: [],
  controllers: [StatusController],
  providers: [StatusService],
})
export class WwwModule {}
