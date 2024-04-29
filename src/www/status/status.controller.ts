import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { StatusService } from './status.service';

@ApiTags('Main - Bot Status API')
@Controller('www/status')
export class StatusController {
  private readonly logger = new Logger(StatusController.name);

  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({
    summary: 'Bot Status',
    description:
      '한디리 (https://koreanbots.dev)에서 봇의 상태(서버수, 하트수)를 가져옵니다.',
  })
  async getStatus(): Promise<{
    votes?: number;
    servers?: number;
  }> {
    return await this.statusService.getStatus();
  }
}
