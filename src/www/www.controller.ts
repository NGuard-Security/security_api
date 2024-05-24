import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { WwwService } from './www.service';

@ApiTags('Main - Rendering Data API')
@Controller('www')
export class WwwController {
  private readonly logger = new Logger(WwwController.name);

  constructor(private readonly wwwService: WwwService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Bot Status',
    description:
      '한디리 (https://koreanbots.dev)에서 봇의 상태(서버수, 하트수)를 가져옵니다.',
  })
  async getStatus(): Promise<{
    votes?: number;
    servers?: number;
  }> {
    return await this.wwwService.getStatus();
  }
}
