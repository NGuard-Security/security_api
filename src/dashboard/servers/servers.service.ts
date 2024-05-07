import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';

import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import {
  type RESTError,
  type RESTGetAPICurrentUserGuildsResult,
} from 'discord-api-types/v10';

import { APIException } from 'src/common/dto/APIException.dto';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getServers(
    access_token: string,
    userId: string,
    now?: string,
  ): Promise<RESTGetAPICurrentUserGuildsResult> {
    let userGuilds: RESTGetAPICurrentUserGuildsResult;

    const cachedCurrentUserGuild =
      await this.cacheManager.get<RESTGetAPICurrentUserGuildsResult>(
        `userguilds:${userId}`,
      );

    if (cachedCurrentUserGuild) {
      this.logger.debug(
        `Cached User Guilds => ${JSON.stringify(cachedCurrentUserGuild)}`,
      );

      userGuilds = cachedCurrentUserGuild;
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
                throw new APIException(
                  HttpStatus.TOO_MANY_REQUESTS,
                  'Discord API 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
                  err.response?.data,
                );
              }

              throw new APIException(
                err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
                (err.response.data as RESTError)?.message ||
                  '내부 서버 오류가 발생했습니다.',
              );
            }),
          ),
      );

      await this.cacheManager.set(`userguilds:${userId}`, data, 15 * 60 * 1000);

      this.logger.debug(`User Guilds cache set => ${JSON.stringify(data)}`);
      userGuilds = data;
    }

    // 권한 있는 서버만 필터링
    userGuilds = userGuilds.filter(
      (guild) => (Number(guild.permissions) & 0x20) == 0x20 || guild.owner,
    );

    let botGuilds: RESTGetAPICurrentUserGuildsResult = [];

    const cachedBotGuilds =
      await this.cacheManager.get<RESTGetAPICurrentUserGuildsResult>(
        'bot-guilds',
      );

    if (cachedBotGuilds) {
      this.logger.debug(
        `Cached Bot Guilds => ${JSON.stringify(cachedBotGuilds)}`,
      );

      botGuilds = cachedBotGuilds;
    } else {
      const data = [];

      // after값이 없을 때 까지 반복 요청해서 모든 서버를 가져옵니다.
      let after: string;
      while (true) {
        const { data: botGuildsData } = await firstValueFrom(
          this.httpService
            .get<RESTGetAPICurrentUserGuildsResult>(
              'https://discord.com/api/v10/users/@me/guilds' +
                (after ? `?after=${after}` : ''),
              {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                },
              },
            )
            .pipe(
              catchError((err: AxiosError) => {
                this.logger.error(
                  `GetCurrentUserGuild (Bot) Error => ${JSON.stringify(
                    err.response.data,
                  )}`,
                );

                if (err.response?.status === 429) {
                  throw new APIException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    'Discord API 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
                    err.response?.data,
                  );
                }

                throw new APIException(
                  err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
                  (err.response.data as RESTError)?.message ||
                    '내부 서버 오류가 발생했습니다.',
                );
              }),
            ),
        );

        data.push(...botGuildsData);

        if (botGuildsData.length != 200) {
          break;
        } else {
          after = botGuildsData[botGuildsData.length - 1].id;
        }
      }

      await this.cacheManager.set('bot-guilds', data, 5 * 60 * 1000);

      this.logger.debug(`Bot Guilds cache set => ${JSON.stringify(data)}`);
      botGuilds = data;
    }

    // 봇이 초대되어있는지 확인
    userGuilds.forEach((guild) => {
      if (botGuilds.find((x) => x.id === guild.id)) {
        // 봇이 초대되어 있는 경우임.
        // guild값에 isInvited를 true로 추가함.
        guild['isInvited'] = true;
      } else {
        // 봇이 초대되어 있지 않은 경우임.
        // guild값에 isInvited를 false로 추가함.
        guild['isInvited'] = false;
      }
    });

    userGuilds.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));

    if (now) {
      // now 값에 해당하는 서버 배열에서 맨 앞으로 이동함.
      const nowGuild = userGuilds.find((x) => x.id === now);
      userGuilds.splice(userGuilds.indexOf(nowGuild), 1);
      userGuilds.unshift(nowGuild);
    }

    return userGuilds;
  }
}
