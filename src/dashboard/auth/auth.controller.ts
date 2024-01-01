import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { authCallbackResponseDto } from './dto/authCallbackResponse.dto';
import { discordUserResponseDto } from './dto/discordUserResponse.dto';
import { AuthGuard } from './auth.guard';

import { APIError } from 'src/common/dto/APIError.dto';

@ApiTags('Dashboard - Authentication API')
@Controller('dashboard/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('callback')
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
    @Query('code') code: string,
  ): Promise<authCallbackResponseDto> {
    try {
      return {
        code: 'OPERATION_COMPLETE',
        status: HttpStatus['OK'],
        data: await this.authService.callback(code),
      };
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      );
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Discord Get User Profile',
    description: 'Discord의 OAuth2 사용자 정보를 가져옵니다.',
  })
  @ApiOkResponse({
    description: '로그인 사용자 정보',
    type: discordUserResponseDto,
  })
  getProfile(@Request() req): discordUserResponseDto {
    return {
      code: 'OPERATION_COMPLETE',
      status: HttpStatus['OK'],
      data: req.user,
    };
  }
}
