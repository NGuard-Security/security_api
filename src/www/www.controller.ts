import { Body, Controller, Get, Post, HttpCode, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { WwwService } from './www.service';

import {
  DiscordEventPayloadDto,
  DiscordWebhookType,
} from './dto/discordEventPayload.dto';

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

  @Post('status/webhook')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Discord Webhook for Bot Status Update',
    description:
      'Discord 웹훅을 통하여 한디리 (https://koreanbots.dev)의 봇 상태를 업데이트 합니다.',
  })
  async updateStatusHook(
    @Body() body: DiscordEventPayloadDto,
  ): Promise<boolean> {
    if (body.type === DiscordWebhookType.PING) return;

    await this.wwwService.updateStatus(body);
    return true;
  }
}
