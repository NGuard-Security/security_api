import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';
import { Bot, Koreanbots } from 'koreanbots';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);

  private readonly koreanbotsClient = new Koreanbots({
    clientID: process.env.DISCORD_CLIENT_ID,
    api: {
      token: process.env.KOREANBOTS_TOKEN,
    },
  });

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getStatus(): Promise<{
    votes?: number;
    servers?: number;
  }> {
    let koreanbots: Bot;

    const redisCachedKoreanbots =
      await this.cacheManager.get<Bot>('koreanbots');

    if (redisCachedKoreanbots) {
      koreanbots = redisCachedKoreanbots;
    } else {
      const locallyCachedKoreanbots = this.koreanbotsClient.bots.cache.get(
        process.env.DISCORD_CLIENT_ID,
      );

      if (locallyCachedKoreanbots) {
        koreanbots = locallyCachedKoreanbots;
      } else {
        koreanbots = await this.koreanbotsClient.bots.fetch(
          process.env.DISCORD_CLIENT_ID,
        );

        await this.cacheManager.set('koreanbots', koreanbots, 600000);
      }
    }

    this.logger.debug(koreanbots);

    return {
      servers: koreanbots.servers,
      votes: koreanbots.votes,
    };
  }
}
