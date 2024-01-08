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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { VerifyService } from './verify.service';
import { verifyConfigResponseDto } from './dto/verifyConfigResponse.dto';
import { verifyConfigUpdateRequestDto } from './dto/verifyConfigUpdateRequest.dto';
import { verifyConfigUpdateResponseDto } from './dto/verifyConfigUpdateResponse.dto';

import { AuthGuard } from 'src/dashboard/auth/auth.guard';
import { AuthService } from 'src/dashboard/auth/auth.service';
import { APIError } from 'src/common/dto/APIError.dto';

@ApiTags('Dashboard - Server API')
@ApiBearerAuth()
@Controller('dashboard/verify')
export class VerifyController {
  private readonly logger = new Logger(VerifyController.name);

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
  @ApiOkResponse({
    description: '현재 버튼 인증 설정',
    type: verifyConfigResponseDto,
  })
  async getCurrentConfig(
    @Request() req,
    @Query('id') id: string,
  ): Promise<verifyConfigResponseDto> {
    try {
      const access_token = req.headers['authorization'].split(' ')[1];

      const hasPermission = await this.authService.hasPermission(
        id,
        req.user.id,
        access_token,
      );

      if (hasPermission) {
        if (!id) {
          throw new APIError(HttpStatus.BAD_REQUEST, '서버 ID를 입력해주세요.');
        }

        return {
          code: 'OPERATION_COMPLETE',
          status: HttpStatus.OK,
          data: await this.verifyService.getCurrentConfig(id),
        };
      } else {
        throw new APIError(
          HttpStatus.FORBIDDEN,
          '해당 서버에 접근할 권한이 없습니다.',
        );
      }
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('')
  @ApiOperation({
    summary: 'Create/Update/Delete button-verify feature configuration',
    description: '해당 서버의 버튼 인증 설정을 생성/변경/삭제합니다.',
  })
  @ApiOkResponse({
    description: '버튼 인증 설정 변경 결과',
    type: verifyConfigUpdateResponseDto,
  })
  async updateConfig(
    @Request() req,
    @Query('id') id: string,
    @Body() body: verifyConfigUpdateRequestDto,
  ): Promise<verifyConfigUpdateResponseDto> {
    try {
      const access_token = req.headers['authorization'].split(' ')[1];

      const hasPermission = await this.authService.hasPermission(
        id,
        req.user.id,
        access_token,
      );

      if (hasPermission) {
        if (!id) {
          throw new APIError(HttpStatus.BAD_REQUEST, '서버 ID를 입력해주세요.');
        }

        const isAlreadyUsingService =
          await this.verifyService.isAlreadyUsingService(id);

        if (isAlreadyUsingService && body.status) {
          await this.verifyService.updateConfig(id, body.role.id);
        } else if (isAlreadyUsingService && !body.status) {
          await this.verifyService.removeConfig(id);
        } else {
          await this.verifyService.createConfig(id, body.role.id);
        }

        return {
          code: 'OPERATION_COMPLETE',
          status: HttpStatus.OK,
          message:
            "Successfully updated server's button-verify feature config.",
        };
      } else {
        throw new APIError(
          HttpStatus.FORBIDDEN,
          '해당 서버에 접근할 권한이 없습니다.',
        );
      }
    } catch (e) {
      throw new HttpException(
        e,
        HttpStatus[(e.code as string) || 'INTERNAL_SERVER_ERROR'],
      );
    }
  }
}
