import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';

import { Model } from 'mongoose';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { type RESTError, type APIGuildMember } from 'discord-api-types/v10';
import { APIError } from 'src/common/dto/APIError.dto';

import { summaryDataDto } from './dto/summaryData.dto';

import { IBlacklist } from 'src/repository/schemas/blacklist.schema';
import { IUsers } from 'src/repository/schemas/users.schema';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject('BLACKLIST_MODEL')
    private readonly blacklistModel: Model<IBlacklist>,
    @Inject('USERS_MODEL')
    private readonly usersModel: Model<IUsers>,
    private readonly httpService: HttpService,
  ) {}

  async getSummary(id: string): Promise<summaryDataDto> {
    let membersList: APIGuildMember[];

    const cachedMembersList = await this.cacheManager.get<APIGuildMember[]>(
      `members:${id}`,
    );

    if (cachedMembersList) {
      this.logger.debug(
        `Cached Members List => ${JSON.stringify(membersList)}`,
      );

      membersList = cachedMembersList;
    } else {
      const { data } = await firstValueFrom(
        this.httpService
          .get<APIGuildMember[]>(
            `https://discord.com/api/v10/guilds/${id}/members?limit=1000`,
            {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              },
            },
          )
          .pipe(
            catchError((err: AxiosError) => {
              this.logger.error(
                `GetGuildMembers Error => ${JSON.stringify(err.response.data)}`,
              );

              throw new APIError(
                err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
                (err.response.data as RESTError)?.message ||
                  '내부 서버 오류가 발생했습니다.',
              );
            }),
          ),
      );

      await this.cacheManager.set(`members:${id}`, data, 15 * 60 * 1000);

      this.logger.debug(`Members cache set => ${JSON.stringify(data)}`);
      membersList = data;
    }

    const users = [];
    const bots = [];

    membersList.forEach((user) => {
      if (user.user.bot) {
        bots.push(user);
      } else {
        users.push(user);
      }
    });

    const blacklist = await this.blacklistModel
      .find()
      .where('guild')
      .equals(id);

    const globalBlacklist = await this.blacklistModel
      .find()
      .where('guild')
      .equals('global');

    const dbUsers = JSON.parse(
      JSON.stringify(await this.usersModel.find().where('servers').equals(id)),
    );

    const newUsers = dbUsers.filter(
      (user) =>
        new Date().getTime() - new Date(user.registeredAt).getTime() <
        1000 * 60 * 60 * 24 * 30,
    );

    // 현재 날짜를 기준으로 지난 12개월의 월을 배열로 만듭니다.
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.getMonth();
    }).reverse();

    // 각 월에 대한 접속자 수를 저장할 배열을 초기화합니다.
    const graph = new Array(12).fill(0);

    dbUsers.forEach((user) => {
      // 사용자가 최근 1년 이내에 접속했는지 확인합니다.
      if (
        new Date(user.registeredAt).getTime() >
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).getTime()
      ) {
        // 사용자가 접속한 월을 가져옵니다.
        const userMonth = new Date(user.registeredAt).getMonth();

        // 해당 월이 배열에 있는지 확인하고, 있다면 카운터를 증가시킵니다.
        const index = months.indexOf(userMonth);
        if (index !== -1) {
          graph[index] += 1;
        }
      }
    });

    return {
      bot: bots.length,
      user: users.length,
      new_user: newUsers.length,
      black_user: blacklist.length + globalBlacklist.length,
      chart_data: graph,
    };
  }
}
