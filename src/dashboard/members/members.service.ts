import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';

import { Model } from 'mongoose';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { type RESTError, type APIGuildMember } from 'discord-api-types/v10';

import { discordUserDto } from './dto/discordUser.dto';
import { APIError, APIErrorCodes } from 'src/common/dto/APIError.dto';

import { IBlacklist } from 'src/repository/schemas/blacklist.schema';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject('BLACKLIST_MODEL')
    private readonly blacklistModel: Model<IBlacklist>,
    private readonly httpService: HttpService,
  ) {}

  async getMembersList(guildId: string): Promise<any> {
    let membersList: APIGuildMember[];

    const cachedMembersList = await this.cacheManager.get<APIGuildMember[]>(
      `members:${guildId}`,
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
            `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`,
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
                APIErrorCodes[String(err.response.status || 500)],
                err.response.status || HttpStatus['INTERNAL_SERVER_ERROR'],
                (err.response.data as RESTError)?.message ||
                  '내부 서버 오류가 발생했습니다.',
              );
            }),
          ),
      );

      await this.cacheManager.set(`members:${guildId}`, data, 3600);

      this.logger.debug(`Members cache set => ${JSON.stringify(data)}`);
      membersList = data;
    }

    const users = membersList.filter((user) => !user.user.bot);

    const sblacklist = await this.blacklistModel
      .find()
      .where('guild')
      .equals(guildId);

    const gBlacklist = await this.blacklistModel
      .find()
      .where('guild')
      .equals('global');

    const blacklist = []
      .concat(sblacklist)
      .concat(gBlacklist)
      .map((user) => user.user);

    users.forEach((user) => {
      user.user['isBlackList'] = blacklist.includes(user.user.id);
      user.user['nickName'] =
        user.nick || user.user.global_name || user.user.username;
      user.user['icon'] = user.user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.user.id}/${user.user.avatar}.webp?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${Math.floor(
            Math.random() * 6,
          )}.png`;
      user.user['userName'] =
        user.user.discriminator !== '0'
          ? `${user.user.username}#${user.user.discriminator}`
          : user.user.username;

      delete user.user.avatar;
      delete user.user.avatar_decoration;
      delete user.user.public_flags;
      delete user.nick;
      delete user.user.global_name;
      delete user.user.username;
      delete user.user.discriminator;
    });

    return users
      .map((user) => user.user)
      .sort((a, b) =>
        a['nickName'].localeCompare(b['nickName'], 'ko-KR'),
      ) as discordUserDto[];
  }

  async updateBlacklist(guildId: string, userId: string): Promise<boolean> {
    const gBlacklist = await this.blacklistModel
      .findOne()
      .where('guild')
      .equals('global')
      .where('user')
      .equals(userId);

    if (gBlacklist) {
      throw new APIError(
        APIErrorCodes['409'],
        HttpStatus['CONFLICT'],
        '해당 유저는 글로벌 블랙리스트로 이미 등록되어 있습니다.',
      );
    }

    const sblacklist = await this.blacklistModel
      .findOne()
      .where('guild')
      .equals(guildId)
      .where('user')
      .equals(userId);

    if (sblacklist) {
      await this.blacklistModel.deleteOne({
        guild: guildId,
        user: userId,
      });
      return false;
    } else {
      await this.blacklistModel.create({
        guild: guildId,
        user: userId,
        reason: '관리자 요청',
      });

      return true;
    }
  }
}
