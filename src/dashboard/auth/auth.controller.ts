import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'

import { AuthCallbackDto } from './dto/authCallback.dto'

import { AuthCallbackRequestDto } from './dto/authCallbackRequest.dto'
import { AuthRevokeRequestDto } from './dto/authRevokeRequest.dto'

@ApiTags('Dashboard - Authentication API')
@Controller('dashboard/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  // #region Discord OAuth2 Callback
  @Post('callback')
  @ApiOperation({
    summary: 'Discord OAuth2 Callback',
    description: 'Discord의 OAuth2 로그인의 콜백을 처리합니다.',
  })
  async callback(
    @Body() body: AuthCallbackRequestDto,
  ): Promise<AuthCallbackDto> {
    try {
      return await this.authService.callback(body.code)
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      )
    }
  }
  // #endregion

  // #region Discord OAuth2 Revoke
  @Post('revoke')
  @ApiOperation({
    summary: 'Discord OAuth2 Revoke',
    description: 'Discord의 OAuth2 토큰을 폐기하여 로그아웃을 처리합니다.',
  })
  async revoke(@Body() body: AuthRevokeRequestDto): Promise<void> {
    try {
      return await this.authService.revoke(body.token, body.token_type_hint)
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      )
    }
  }
  // #endregion
}
