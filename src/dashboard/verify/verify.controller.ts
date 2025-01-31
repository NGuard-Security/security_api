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

import { VerifyService } from './verify.service'

import { AuthGuard } from 'src/dashboard/auth/auth.guard'
import { AuthService } from 'src/dashboard/auth/auth.service'

import { VerifyConfigDto } from './dto/verifyConfig.dto'

import { VerifyConfigUpdateRequestDto } from './dto/verifyConfigUpdateRequest.dto'

import { APIException } from 'src/common/dto/APIException.dto'

@ApiTags('Dashboard - Server API')
@ApiBearerAuth()
@Controller('dashboard/verify')
export class VerifyController {
  private readonly logger = new Logger(VerifyController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly verifyService: VerifyService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({
    summary: 'Get current configuration of button-verify feature',
    description: '해당 서버의 현재 버튼 인증 설정을 가져옵니다.',
  })
  async getCurrentConfig(
    @Request() req,
    @Query('id') id: string,
  ): Promise<VerifyConfigDto> {
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

        return await this.verifyService.getCurrentConfig(id)
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
    summary: 'Create/Update/Delete button-verify feature configuration',
    description: '해당 서버의 버튼 인증 설정을 생성/변경/삭제합니다.',
  })
  async updateConfig(
    @Request() req,
    @Query('id') id: string,
    @Body() body: VerifyConfigUpdateRequestDto,
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

        const isAlreadyUsingService =
          await this.verifyService.isAlreadyUsingService(id)

        if (isAlreadyUsingService && body.status) {
          await this.verifyService.updateConfig(id, body.role.id)
        } else if (isAlreadyUsingService && !body.status) {
          await this.verifyService.removeConfig(id)
        } else {
          await this.verifyService.createConfig(id, body.role.id)
        }

        return "Successfully updated server's button-verify feature config."
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
