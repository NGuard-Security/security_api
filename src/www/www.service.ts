import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';

import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { ApplicationIntegrationType } from 'discord-api-types/v10';

import { DiscordEventType } from './dto/discordEventPayload.dto';

type KoreanbotsPartialBot = {
  servers?: number;
  votes?: number;
};

@Injectable()
export class WwwService {
  private readonly logger = new Logger(WwwService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getStatus(): Promise<{
    votes?: number;
    servers?: number;
  }> {
    try {
      const redisCachedKoreanbots =
        await this.cacheManager.get<KoreanbotsPartialBot>('koreanbots');

      if (redisCachedKoreanbots) {
        return {
          servers: redisCachedKoreanbots.servers,
          votes: redisCachedKoreanbots.votes,
        };
      }

      const { data: koreanbots } = await firstValueFrom(
        this.httpService
          .get<{ code: number; data: KoreanbotsPartialBot; version: 2 }>(
            `https://koreanbots.dev/api/v2/bots/${process.env.DISCORD_CLIENT_ID}`,
            {
              headers: {
                Authorization: process.env.KOREANBOTS_TOKEN,
              },
            },
          )
          .pipe(
            catchError((err: AxiosError) => {
              this.logger.error(
                `FetchKoreanbotsBot Error => ${JSON.stringify(
                  err.response.data,
                )}`,
              );

              throw err;
            }),
          ),
      );

      await this.cacheManager.set('koreanbots', koreanbots.data, 60 * 5);

      this.logger.debug(koreanbots.data);

      return {
        servers: koreanbots.data.servers,
        votes: koreanbots.data.votes,
      };
    } catch (e) {
      this.logger.error(e);

      return {
        servers: null,
        votes: null,
      };
    }
  }

  async updateStatus(body: DiscordEventPayloadDto): Promise<void> {
    if (
      body.event?.type !== DiscordEventType.APPLICATION_AUTHORIZED ||
      body.event?.data.integration_type !==
        ApplicationIntegrationType.GuildInstall
    ) {
      return;
    }

    if (this.cacheManager.get('koreanbots:syncedPreviously')) {
      return;
    }

    await this.cacheManager.set('koreanbots:syncedPreviously', true, 60 * 3);

    await this.cacheManager.del('bot-guilds');
    await firstValueFrom(
      this.httpService
        .post<{ code: number; message: string; version: 2 }>(
          `https://koreanbots.dev/api/v2/bots/${process.env.DISCORD_CLIENT_ID}/stats`,
          {
            servers: (await getBotGuilds()).length,
            shards: 0,
          },
          {
            headers: {
              Authorization: process.env.KOREANBOTS_TOKEN,
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error(
              `SyncKoreanbotsStatus Error => ${JSON.stringify(err.response.data)}`,
            );

            throw new APIException(
              err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
              (
                err.response.data as {
                  code: number;
                  message: string;
                  version: 2;
                }
              )?.message || '내부 서버 오류가 발생했습니다.',
            );
          }),
        ),
    );

    await this.cacheManager.del('koreanbots');
  }
}
