import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'

import { InviteService } from './invite.service'
import { generateRandomCode } from 'src/common/utils/generateRandomCode'

import { GuildDto } from './dto/guild.dto'
import { VerifyRequestDto } from './dto/verify.dto'

@ApiTags('Invite API')
@Controller('invite')
export class InviteController {
  private readonly logger = new Logger(InviteController.name)

  constructor(private readonly inviteService: InviteService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get Invite guild info',
    description: '초대링크 ID를 통해 해당 서버의 정보를 가져옵니다.',
  })
  async getGuildByInviteId(@Param('id') id: string): Promise<GuildDto> {
    return await this.inviteService.getGuildByInviteId(id)
  }

  @Post('actions/captcha')
  @ApiOperation({
    summary: '(Verification Step 1) Verify Captcha',
    description: '(초대링크 인증 1단계) 캡차를 검증합니다.',
  })
  async verifyCaptcha(
    @Req() req,
    @Body() body: VerifyRequestDto,
  ): Promise<{
    success: true
    nextStep: 'OAUTH' | 'VERIFY' | 'JOIN'
  }> {
    return await this.inviteService.verifyCaptcha(req, body)
  }

  @Get('actions/oauth/google')
  @ApiOperation({
    summary: '(Verification Step 2) Google OAuth',
    description: '(초대링크 인증 2단계) 구글 OAuth를 진행합니다.',
  })
  googleOAuth(@Res() res: FastifyReply): FastifyReply {
    return res
      .status(302)
      .redirect(
        `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.INVITE_AUTH_ENDPOINT}/google-callback&response_type=code&scope=email profile&state=${generateRandomCode()}`,
      )
  }

  @Get('actions/oauth/naver')
  @ApiOperation({
    summary: '(Verification Step 2) Naver OAuth',
    description: '(초대링크 인증 2단계) 네이버 OAuth를 진행합니다.',
  })
  naverOAuth(@Res() res: FastifyReply): FastifyReply {
    return res
      .status(302)
      .redirect(
        `https://nid.naver.com/oauth2.0/authorize?client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.INVITE_AUTH_ENDPOINT}/naver-callback&response_type=code&state=${generateRandomCode()}`,
      )
  }

  @Get('actions/oauth/kakao')
  @ApiOperation({
    summary: '(Verification Step 2) Kakao OAuth',
    description: '(초대링크 인증 2단계) 카카오 OAuth를 진행합니다.',
  })
  kakaoOAuth(@Res() res: FastifyReply): FastifyReply {
    return res
      .status(302)
      .redirect(
        `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.INVITE_AUTH_ENDPOINT}/kakao-callback&response_type=code&state=${generateRandomCode()}`,
      )
  }

  @Get('actions/oauth/google-callback')
  @ApiOperation({
    summary: '(Verification Step 2) Google OAuth Callback',
    description: '(초대링크 인증 2단계) 구글 OAuth 콜백을 진행합니다.',
  })
  async googleOAuthCallback(
    @Query('code') code: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.inviteService.googleOAuthCallback(code)

      res.header('Content-Type', 'text/html')
      return res.send(result)
    } catch (e) {
      throw e
    }
  }

  @Get('actions/oauth/naver-callback')
  @ApiOperation({
    summary: '(Verification Step 2) Naver OAuth Callback',
    description: '(초대링크 인증 2단계) 네이버 OAuth 콜백을 진행합니다.',
  })
  async naverOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.inviteService.naverOAuthCallback(code, state)

      res.header('Content-Type', 'text/html')
      return res.send(result)
    } catch (e) {
      throw e
    }
  }

  @Get('actions/oauth/kakao-callback')
  @ApiOperation({
    summary: '(Verification Step 2) Kakao OAuth Callback',
    description: '(초대링크 인증 2단계) 카카오 OAuth 콜백을 진행합니다.',
  })
  async kakaoOAuthCallback(
    @Query('code') code: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.inviteService.kakaoOAuthCallback(code)

      res.header('Content-Type', 'text/html')
      return res.send(result)
    } catch (e) {
      throw e
    }
  }
}
