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

import { InviteService } from './invite.service';
import { inviteConfigResponseDto } from './dto/inviteConfigResponse.dto';
import { inviteConfigUpdateRequestDto } from './dto/inviteConfigUpdateRequest.dto';
import { inviteConfigUpdateResponseDto } from './dto/inviteConfigUpdateResponse.dto';

import { AuthGuard } from 'src/dashboard/auth/auth.guard';
import { AuthService } from 'src/dashboard/auth/auth.service';
import { APIError } from 'src/common/dto/APIError.dto';

@ApiTags('Dashboard - Server API')
@ApiBearerAuth()
@Controller('dashboard/invite')
export class InviteController {
  private readonly logger = new Logger(InviteController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly inviteService: InviteService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({
    summary: 'Get current configuration of secure invite feature',
    description: '해당 서버의 현재 보안 초대 기능 설정을 가져옵니다.',
  })
  @ApiOkResponse({
    description: '현재 보안 초대 기능 설정',
    type: inviteConfigResponseDto,
  })
  async getCurrentConfig(
    @Request() req,
    @Query('id') id: string,
  ): Promise<inviteConfigResponseDto> {
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
          data: await this.inviteService.getCurrentConfig(id, req.user),
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
    summary: 'Create/Update/Delete secure invite feature configuration',
    description: '해당 서버의 보안 초대 기능 설정을 생성/변경/삭제합니다.',
  })
  @ApiOkResponse({
    description: '보안 초대 기능 설정 변경 결과',
    type: inviteConfigUpdateResponseDto,
  })
  async updateConfig(
    @Request() req,
    @Query('id') id: string,
    @Body() body: inviteConfigUpdateRequestDto,
  ): Promise<inviteConfigUpdateResponseDto> {
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
          await this.inviteService.isAlreadyUsingService(id);

        if (isAlreadyUsingService && body.status) {
          await this.inviteService.updateConfig(
            id,
            body.settings,
            body.link,
            body.domain,
          );
        } else if (isAlreadyUsingService && !body.status) {
          await this.inviteService.removeConfig(id);
        } else {
          await this.inviteService.createConfig(
            id,
            body.settings,
            body.link,
            body.domain,
          );
        }

        return {
          code: 'OPERATION_COMPLETE',
          status: HttpStatus.OK,
          message:
            "Successfully updated server's secure invite feature config.",
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
