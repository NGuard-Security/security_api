import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';
import { Bot, Koreanbots } from 'koreanbots';

@Injectable()
export class WwwService {
  private readonly logger = new Logger(WwwService.name);

  // private readonly koreanbotsClient = new Koreanbots({
  //   clientID: process.env.DISCORD_CLIENT_ID,
  //   api: {
  //     token: process.env.KOREANBOTS_TOKEN,
  //   },
  // });

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getStatus(): Promise<{
    votes?: number;
    servers?: number;
  }> {
    // try {
    //   let koreanbots: Bot;
  
    //   const redisCachedKoreanbots =
    //     await this.cacheManager.get<Bot>('koreanbots');
  
    //   if (redisCachedKoreanbots) {
    //     koreanbots = redisCachedKoreanbots;
    //   } else {
    //     const locallyCachedKoreanbots = this.koreanbotsClient.bots.cache.get(
    //       process.env.DISCORD_CLIENT_ID,
    //     );
  
    //     if (locallyCachedKoreanbots) {
    //       koreanbots = locallyCachedKoreanbots;
    //     } else {
    //       koreanbots = this.koreanbotsClient.mybot.bot;
    //       await this.cacheManager.set('koreanbots', koreanbots, 600000);
    //     }
    //   }
  
    //   this.logger.debug(koreanbots);
  
    //   return {
    //     servers: koreanbots.servers,
    //     votes: koreanbots.votes,
    //   };
    // } catch (e) {
    //   this.logger.error(e);

    //   return {
    //     servers: null,
    //     votes: null,
    //   };
    // }

    // 한디리 서버 오류로 임시 주석처리
    return {
      servers: null,
      votes: null,
    }
  }
}
