import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { MembersService } from './members.service'

import { AuthGuard } from 'src/dashboard/auth/auth.guard'
import { AuthService } from 'src/dashboard/auth/auth.service'

import { DiscordUserDto } from './dto/discordUser.dto'

import { BlacklistUpdateRequestDto } from './dto/blacklistUpdateRequest.dto'

import { APIException } from 'src/common/dto/APIException.dto'

@ApiTags('Dashboard - Server API')
@ApiBearerAuth()
@Controller('dashboard/members')
export class MembersController {
  private readonly logger = new Logger(MembersController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly membersService: MembersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({
    summary: 'Get Members List of Server',
    description: '해당 서버의 사용자 리스트를 가져옵니다.',
  })
  async getSummary(
    @Request() req,
    @Query('id') id: string,
  ): Promise<DiscordUserDto[]> {
    try {
      const access_token = req.headers['authorization'].split(' ')[1]

      const hasPermission = await this.authService.hasPermission(
        id,
        req.user.id,
        access_token,
      )

      if (hasPermission) {
        if (!id) {
          throw new APIException(
            HttpStatus.BAD_REQUEST,
            '서버 ID를 입력해주세요.',
          )
        }

        return await this.membersService.getMembersList(id)
      } else {
        throw new APIException(
          HttpStatus.FORBIDDEN,
          '해당 서버에 접근할 권한이 없습니다.',
        )
      }
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      )
    }
  }

  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({
    summary: 'Add/remove user to blacklist of server',
    description: '특정 사용자를 해당 서버에서 블랙리스트에 추가/삭제합니다.',
  })
  async updateConfig(
    @Request() req,
    @Query('id') id: string,
    @Body() body: BlacklistUpdateRequestDto,
  ): Promise<string> {
    try {
      const access_token = req.headers['authorization'].split(' ')[1]

      const hasPermission = await this.authService.hasPermission(
        id,
        req.user.id,
        access_token,
      )

      if (hasPermission) {
        if (!id) {
          throw new APIException(
            HttpStatus.BAD_REQUEST,
            '서버 ID를 입력해주세요.',
          )
        }

        await this.membersService.updateBlacklist(id, body.member)

        return "Successfully modified server's user blacklist."
      } else {
        throw new APIException(
          HttpStatus.FORBIDDEN,
          '해당 서버에 접근할 권한이 없습니다.',
        )
      }
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      )
    }
  }
}
