import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { HttpService } from '@nestjs/axios'

import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { type APIGuildPreview } from 'discord-api-types/v10'

import { Cache } from 'cache-manager'
import { Model } from 'mongoose'

import { GuildDto } from './dto/guild.dto'

import { ISettings } from 'src/repository/schemas/settings.schema'
import { APIException } from 'src/common/dto/APIException.dto'
import { VerifyRequestDto } from './dto/verify.dto'

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name)

  constructor(
    @Inject('SETTINGS_MODEL')
    private readonly settingsModel: Model<ISettings>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getGuildByInviteId(id: string): Promise<GuildDto> {
    const cachedGuild = await this.cacheManager.get<GuildDto>(`invite:${id}`)

    if (cachedGuild) {
      return cachedGuild
    }

    const settings = await this.settingsModel.findOne().where('link').equals(id)

    if (!settings) {
      throw new APIException(
        HttpStatus.NOT_FOUND,
        '존재하지 않는 초대링크입니다.',
      )
    }

    const { data: guild } = await firstValueFrom(
      this.httpService
        .get<APIGuildPreview>(
          `https://discord.com/api/v10/guilds/${settings.guild}/preview`,
          {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              `Discord GuildPreview Error => ${JSON.stringify(err.response.data)}`,
            )

            throw new APIException(
              err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
              (err.response.data as any)?.message ||
                '내부 서버 오류가 발생했습니다.',
            )
          }),
        ),
    )

    const guildData: GuildDto = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      member_count: {
        everyone: guild.approximate_member_count,
        online: guild.approximate_presence_count,
      },
      config: {
        captcha: settings.settings >= 1,
        oauth: settings.settings === 3,
        verify: settings.settings === 4,
      },
    }

    await this.cacheManager.set(`invite:${id}`, guildData, 60 * 60 * 24 * 3)

    return guildData
  }

  async verifyCaptcha(
    req,
    body: VerifyRequestDto,
  ): Promise<{
    success: true
    nextStep: 'OAUTH' | 'VERIFY' | 'JOIN'
  }> {
    const settings = await this.settingsModel
      .findOne()
      .where('guild')
      .equals(body.guild)

    if (!settings) {
      throw new APIException(
        HttpStatus.NOT_FOUND,
        '존재하지 않는 초대링크입니다.',
      )
    }

    const { data: captcha } = await firstValueFrom(
      this.httpService
        .post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          secret: process.env.CF_TURNSTILE_SECRET_KEY,
          response: body['cf-turnstile-response'],
          remoteip:
            req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress,
        })
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              `Cloudflare Turnstile Error => ${JSON.stringify(err.response.data)}`,
            )

            throw new APIException(
              err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
              (err.response.data as any)?.message ||
                '내부 서버 오류가 발생했습니다.',
            )
          }),
        ),
    )

    if (!captcha.success) {
      throw new APIException(
        HttpStatus.FORBIDDEN,
        '캡챠 인증값이 올바르지 않습니다.',
      )
    }

    return {
      success: true,
      nextStep:
        settings.settings === 3
          ? 'OAUTH'
          : settings.settings === 4
            ? 'VERIFY'
            : 'JOIN',
    }
  }

  async googleOAuthCallback(code: string) {
    const { data: callback } = await firstValueFrom(
      this.httpService
        .post(
          'https://oauth2.googleapis.com/token',
          new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.INVITE_AUTH_ENDPOINT}/google-callback`,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              `Google OAuth2 Callback Error => ${JSON.stringify(err.response.data)}`,
            )

            throw new APIException(
              err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
              err.response.status === HttpStatus.BAD_REQUEST
                ? '만료된 인증 요청입니다. 다시 인증해 주세요.'
                : (err.response.data as any)?.error_description ||
                  '내부 서버 오류가 발생했습니다.',
            )
          }),
        ),
    )

    if (callback.error || callback.error_description) {
      this.logger.error(
        `Google OAuth2 Callback Error => ${JSON.stringify(callback)}`,
      )

      throw new APIException(
        HttpStatus.BAD_REQUEST,
        callback.error_description || '잘못된 요청입니다.',
      )
    }

    const responseData = {
      access_token: callback.access_token as string,
      expires_in: callback.expires_in as number,
      token_type: (callback.token_type as string) || 'bearer',
    }

    return `<script>
      opener.window.postMessage(${JSON.stringify({
        type: 'OAUTH_SIGNIN_COMPLETE',
        data: {
          google: responseData,
        },
      })}, "*");
    </script>`
  }

  async naverOAuthCallback(code: string, state: string) {
    const { data: callback } = await firstValueFrom(
      this.httpService
        .post(
          'https://nid.naver.com/oauth2.0/token',
          new URLSearchParams({
            client_id: process.env.NAVER_CLIENT_ID,
            client_secret: process.env.NAVER_CLIENT_SECRET,
            code: code,
            state: state,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.INVITE_AUTH_ENDPOINT}/naver-callback`,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              `Naver OAuth2 Callback Error => ${JSON.stringify(err.response.data)}`,
            )

            throw new APIException(
              err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
              (err.response.data as any)?.message ||
                '내부 서버 오류가 발생했습니다.',
            )
          }),
        ),
    )

    if (callback.error || callback.error_description) {
      this.logger.error(
        `Naver OAuth2 Callback Error => ${JSON.stringify(callback)}`,
      )

      throw new APIException(
        HttpStatus.BAD_REQUEST,
        callback.error_description === 'no valid data in session'
          ? '만료된 인증 요청입니다. 다시 인증해 주세요.'
          : callback.error_description || '잘못된 요청입니다.',
      )
    }

    return `<script>
      opener.window.postMessage(${JSON.stringify({ type: 'OAUTH_SIGNIN_COMPLETE', data: { naver: callback } })}, "*");
    </script>`
  }

  async kakaoOAuthCallback(code: string) {
    const { data: callback } = await firstValueFrom(
      this.httpService
        .post(
          'https://kauth.kakao.com/oauth/token',
          new URLSearchParams({
            client_id: process.env.KAKAO_CLIENT_ID,
            client_secret: process.env.KAKAO_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.INVITE_AUTH_ENDPOINT}/kakao-callback`,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              `Kakao OAuth2 Callback Error => ${JSON.stringify(err.response.data)}`,
            )

            throw new APIException(
              err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
              (err.response.data as any).error_code === 'KOE320'
                ? '만료된 인증 요청입니다. 다시 시도해 주세요.'
                : (err.response.data as any)?.error_description ||
                  '내부 서버 오류가 발생했습니다.',
            )
          }),
        ),
    )

    if (callback.error || callback.error_description) {
      this.logger.error(
        `Kakao OAuth2 Callback Error => ${JSON.stringify(callback)}`,
      )

      throw new APIException(
        HttpStatus.BAD_REQUEST,
        callback.error_description || '잘못된 요청입니다.',
      )
    }

    return `<script>
      opener.window.postMessage(${JSON.stringify({ type: 'OAUTH_SIGNIN_COMPLETE', data: { kakao: callback } })}, "*");
    </script>`
  }
}
