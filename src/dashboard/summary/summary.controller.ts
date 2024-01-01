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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SummaryService } from './summary.service';
import { summaryDataResponseDto } from './dto/summaryDataResponse.dto';

import { AuthGuard } from 'src/dashboard/auth/auth.guard';
import { AuthService } from 'src/dashboard/auth/auth.service';
import { APIError, APIErrorCodes } from 'src/common/dto/APIError.dto';

@ApiTags('Dashboard - Server API')
@ApiBearerAuth()
@Controller('dashboard/summary')
export class SummaryController {
  private readonly logger = new Logger(SummaryController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly summaryService: SummaryService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('')
  @ApiOperation({
    summary: 'Get Server Summary',
    description: '해당 서버의 요약 정보를 가져옵니다.',
  })
  @ApiOkResponse({
    description: '요청한 서버의 요약 정보',
    type: summaryDataResponseDto,
  })
  async getSummary(
    @Request() req,
    @Query('id') id: string,
  ): Promise<summaryDataResponseDto> {
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
          data: await this.summaryService.getSummary(id),
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
