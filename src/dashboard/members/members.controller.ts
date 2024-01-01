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

import { MembersService } from './members.service';
import { membersListResponseDto } from './dto/membersListResponse.dto';
import { blacklistUpdateRequestDto } from './dto/blacklistUpdateRequest.dto';
import { blacklistUpdateResponseDto } from './dto/blacklistUpdateResponse.dto';

import { AuthGuard } from 'src/dashboard/auth/auth.guard';
import { AuthService } from 'src/dashboard/auth/auth.service';
import { APIError, APIErrorCodes } from 'src/common/dto/APIError.dto';

@ApiTags('Dashboard - Server API')
@ApiBearerAuth()
@Controller('dashboard/members')
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

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
  @ApiOkResponse({
    description: '요청한 서버의 사용자 리스트',
    type: membersListResponseDto,
  })
  async getSummary(
    @Request() req,
    @Query('id') id: string,
  ): Promise<membersListResponseDto> {
    try {
      const access_token = req.headers['authorization'].split(' ')[1];

      const hasPermission = await this.authService.hasPermission(
        id,
        req.user.id,
        access_token,
      );

      if (hasPermission) {
        if (!id) {
          throw new APIError(
            APIErrorCodes['400'],
            HttpStatus['BAD_REQUEST'],
            '서버 ID를 입력해주세요.',
          );
        }

        return {
          code: 'OPERATION_COMPLETE',
          status: HttpStatus['OK'],
          data: await this.membersService.getMembersList(id),
        };
      } else {
        throw new APIError(
          APIErrorCodes['403'],
          HttpStatus['FORBIDDEN'],
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
    summary: 'Add/remove user to blacklist of server',
    description: '특정 사용자를 해당 서버에서 블랙리스트에 추가/삭제합니다.',
  })
  @ApiOkResponse({
    description: '블랙리스트 추가/삭제 결과',
    type: blacklistUpdateResponseDto,
  })
  async updateConfig(
    @Request() req,
    @Query('id') id: string,
    @Body() body: blacklistUpdateRequestDto,
  ): Promise<blacklistUpdateResponseDto> {
    try {
      const access_token = req.headers['authorization'].split(' ')[1];

      const hasPermission = await this.authService.hasPermission(
        id,
        req.user.id,
        access_token,
      );

      if (hasPermission) {
        if (!id) {
          throw new APIError(
            APIErrorCodes['400'],
            HttpStatus['BAD_REQUEST'],
            '서버 ID를 입력해주세요.',
          );
        }

        await this.membersService.updateBlacklist(id, body.member);

        return {
          code: 'OPERATION_COMPLETE',
          status: HttpStatus['OK'],
          message: "Successfully modified server's user blacklist.",
        };
      } else {
        throw new APIError(
          APIErrorCodes['403'],
          HttpStatus['FORBIDDEN'],
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
