import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { authCallbackResponseDto } from './dto/authCallbackResponse.dto';

import { APIError } from 'src/common/dto/APIError.dto';
import { authCallbackRequestDto } from './dto/authCallbackRequest.dto';
import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { authRevokeRequestDto } from './dto/authRevokeRequest.dto';

@ApiTags('Dashboard - Authentication API')
@Controller('dashboard/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // #region Discord OAuth2 Callback
  @Post('callback')
  @ApiOperation({
    summary: 'Discord OAuth2 Callback',
    description: 'Discord의 OAuth2 로그인의 콜백을 처리합니다.',
  })
  @ApiOkResponse({
    description: '로그인 토큰 정보',
    type: authCallbackResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: '로그인 실패 (OAuth 인증 실패)',
    type: APIError,
  })
  async callback(
    @Body() body: authCallbackRequestDto,
  ): Promise<authCallbackResponseDto> {
    try {
      return {
        code: 'OPERATION_COMPLETE',
        status: HttpStatus.OK,
        data: await this.authService.callback(body.code),
      };
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      );
    }
  }
  // #endregion

  // #region Discord OAuth2 Revoke
  @Post('revoke')
  @ApiOperation({
    summary: 'Discord OAuth2 Revoke',
    description: 'Discord의 OAuth2 토큰을 폐기하여 로그아웃을 처리합니다.',
  })
  @ApiOkResponse({
    description: '토큰 폐기 성공 시',
    type: APIResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: '토큰 폐기 실패 (OAuth 인증 실패)',
    type: APIError,
  })
  async revoke(@Body() body: authRevokeRequestDto): Promise<APIResponseDto> {
    try {
      await this.authService.revoke(body.token, body.token_type_hint);

      return {
        code: 'OPERATION_COMPLETE',
        status: HttpStatus.OK,
      };
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      );
    }
  }
  // #endregion
}
