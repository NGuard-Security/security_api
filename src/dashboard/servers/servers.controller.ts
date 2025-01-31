import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Request,
  UseGuards,
  Query,
  HttpException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { AuthGuard } from 'src/dashboard/auth/auth.guard'
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10'

import { ServersService } from './servers.service'

@ApiTags('Dashboard - Server API')
@ApiBearerAuth()
@Controller('dashboard/servers')
export class ServersController {
  private readonly logger = new Logger(ServersController.name)

  constructor(private readonly serversService: ServersService) {}

  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({
    summary: 'Get Servers',
    description: '해당 사용자가 권한을 가지고 있는 서버 목록을 가져옵니다.',
  })
  @ApiQuery({ name: 'now', required: false })
  async getServers(
    @Request() req,
    @Query('now') now?: string,
  ): Promise<RESTGetAPICurrentUserGuildsResult> {
    try {
      const access_token = req.headers['authorization'].split(' ')[1]

      return await this.serversService.getServers(
        access_token,
        req.user.id,
        now,
      )
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      )
    }
  }
}
