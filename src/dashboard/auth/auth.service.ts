import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';

import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { authCallbackDto } from './dto/authCallback.dto';
import { APIError, APIErrorCodes } from 'src/common/dto/APIError.dto';
import { DiscordOauthAPIError } from 'src/common/dto/DiscordOauthAPIError.dto';

import {
  type RESTError,
  type APIGuild,
  type RESTGetAPICurrentUserGuildsResult,
} from 'discord-api-types/v10';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async callback(code: string): Promise<authCallbackDto> {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.AUTH_ENDPOINT + '/auth/callback',
    });

    const { data } = await firstValueFrom(
      this.httpService
        .post<authCallbackDto>(
          'https://discord.com/api/v10/oauth2/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              `Callback Error => ${JSON.stringify(err.response.data)}`,
            );

            if (err.response?.status === 429) {
              throw new APIError(
                APIErrorCodes['429'],
                HttpStatus['TOO_MANY_REQUESTS'],
                'Discord API 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
                err.response?.data,
              );
            }

            throw new APIError(
              APIErrorCodes[String(err.response.status || 500)],
              err.response.status || HttpStatus['INTERNAL_SERVER_ERROR'],
              (err.response.data as DiscordOauthAPIError)?.error_description ||
                '내부 서버 오류가 발생했습니다.',
            );
          }),
        ),
    );

    return data;
  }

  async hasPermission(
    guildId: string,
    userId: string,
    access_token: string,
  ): Promise<boolean> {
    let currentUserGuild: RESTGetAPICurrentUserGuildsResult;

    const cachedCurrentUserGuild =
      await this.cacheManager.get<RESTGetAPICurrentUserGuildsResult>(
        `userguilds:${userId}`,
      );

    if (cachedCurrentUserGuild) {
      this.logger.debug(
        `Cached UserGuild => ${JSON.stringify(cachedCurrentUserGuild)}`,
      );

      currentUserGuild = cachedCurrentUserGuild;
    } else {
      const { data } = await firstValueFrom(
        this.httpService
          .get<RESTGetAPICurrentUserGuildsResult>(
            `https://discord.com/api/v10/users/@me/guilds`,
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            },
          )
          .pipe(
            catchError((err: AxiosError) => {
              this.logger.error(
                `GetCurrentUserGuild Error => ${JSON.stringify(
                  err.response.data,
                )}`,
              );

              if (err.response?.status === 429) {
                throw new APIError(
                  APIErrorCodes['429'],
                  HttpStatus['TOO_MANY_REQUESTS'],
                  'Discord API 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
                  err.response?.data,
                );
              }

              throw new APIError(
                APIErrorCodes[String(err.response.status || 500)],
                err.response.status || HttpStatus['INTERNAL_SERVER_ERROR'],
                (err.response.data as RESTError)?.message ||
                  '내부 서버 오류가 발생했습니다.',
              );
            }),
          ),
      );

      await this.cacheManager.set(`userguilds:${userId}`, data, 60 * 60 * 1000);

      this.logger.debug(`UserGuild cache set => ${JSON.stringify(data)}`);
      currentUserGuild = data;
    }

    const guild = currentUserGuild.find((x) => x.id === guildId);

    if (!guild) {
      return false;
    }

    if ((Number(guild.permissions) & 0x20) !== 0x20) {
      let guildData: APIGuild;

      const cachedGuildData = await this.cacheManager.get<APIGuild>(
        `guild:${guildId}`,
      );

      if (cachedGuildData) {
        this.logger.debug(`Cached Guild => ${JSON.stringify(cachedGuildData)}`);

        guildData = cachedGuildData;
      } else {
        const { data } = await firstValueFrom(
          this.httpService
            .get<APIGuild>(`https://discord.com/api/v10/guilds/${guildId}`, {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            })
            .pipe(
              catchError((err: AxiosError) => {
                this.logger.error(
                  `GetGuild Error => ${JSON.stringify(err.response.data)}`,
                );

                if (err.response?.status === 429) {
                  throw new APIError(
                    APIErrorCodes['429'],
                    HttpStatus['TOO_MANY_REQUESTS'],
                    'Discord API 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
                    err.response?.data,
                  );
                }

                throw new APIError(
                  APIErrorCodes[String(err.response.status || 500)],
                  err.response.status || HttpStatus['INTERNAL_SERVER_ERROR'],
                  (err.response.data as RESTError)?.message ||
                    '내부 서버 오류가 발생했습니다.',
                );
              }),
            ),
        );

        await this.cacheManager.set(`guild:${guildId}`, data, 60 * 60 * 1000);

        this.logger.debug(`Guild cache set => ${JSON.stringify(data)}`);
        guildData = data;
      }

      if (guildData.owner_id !== userId) {
        return false;
      }
    }

    return true;
  }
}
