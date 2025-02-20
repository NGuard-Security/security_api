// import { HttpService } from '@nestjs/axios';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Model } from 'mongoose'

// import { AxiosError } from 'axios';
// import { catchError, firstValueFrom } from 'rxjs';

import { type APIUser } from 'discord-api-types/v10'

import { InviteConfigDto } from './dto/inviteConfig.dto'
import { APIException } from 'src/common/dto/APIException.dto'

import { ISettings } from 'src/repository/schemas/settings.schema'
import { IEnterprise } from 'src/repository/schemas/enterprise.schema'

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name)

  constructor(
    @Inject('SETTINGS_MODEL')
    private readonly settingsModel: Model<ISettings>,
    @Inject('ENTERPRISE_MODEL')
    private readonly enterpriseModel: Model<IEnterprise>,
    // private readonly httpService: HttpService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCurrentConfig(id: string, user: APIUser): Promise<InviteConfigDto> {
    const settings = await this.settingsModel
      .findOne()
      .where('guild')
      .equals(id)

    const payData = await this.enterpriseModel
      .findOne()
      .where('guild')
      .equals(id)

    // const { data: koreanbots } = await firstValueFrom(
    //   this.httpService
    //     .get<{
    //       code: number;
    //       data: {
    //         voted: boolean;
    //         lastVote: number;
    //       };
    //       version: 2;
    //     }>(
    //       `https://koreanbots.dev/api/v2/bots/${process.env.DISCORD_CLIENT_ID}/vote?userID=${user.id}`,
    //       {
    //         headers: {
    //           Authorization: process.env.KOREANBOTS_TOKEN,
    //         },
    //       },
    //     )
    //     .pipe(
    //       catchError((err: AxiosError) => {
    //         this.logger.error(
    //           `CheckKoreanbotsVoted Error => ${JSON.stringify(err.response.data)}`,
    //         );

    //         throw new APIException(
    //           err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
    //           (
    //             err.response.data as {
    //               code: number;
    //               message: string;
    //               version: 2;
    //             }
    //           )?.message || '내부 서버 오류가 발생했습니다.',
    //         );
    //       }),
    //     ),
    // );
    // const koreanbotsVoteData = koreanbots.data;

    // 2025-01-31 한디리 하트체크 bypass
    const koreanbotsVoteData = { voted: true, lastVote: 0 }

    // TODO: 커스텀 도메인 기능 추가

    if (payData) {
      let premiumType: number = 0
      let period: number = -1

      switch (payData.billingType) {
        case 0:
          period = 1
          premiumType = 1
          break
        case 1:
          period = 3
          premiumType = 1
          break
        case 2:
          period = 1
          premiumType = 2
          break
        case 3:
          premiumType = 2
          period = 3
          break
      }

      const expDate = new Date(payData.date)
      expDate.setDate(expDate.getDate() + period)

      if (expDate.getTime() >= Date.now()) {
        return {
          settings: settings,
          koreanbots: { voted: true, lastVote: 0 },
          premiumType: premiumType,
          domain: null,
        }
      }
    }

    return {
      settings: settings,
      koreanbots: koreanbotsVoteData,
      premiumType: 0,
      domain: null,
    }
  }

  async createConfig(
    id: string,
    settings: number,
    link: string,
    // TODO: 커스텀 도메인 기능 추가 후 주석 해제
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    domain?: { domain: string; ssl: boolean },
  ): Promise<boolean> {
    const isLinkAlreadyUsing = await this.settingsModel
      .findOne()
      .where('link')
      .equals(link)

    if (isLinkAlreadyUsing && isLinkAlreadyUsing.guild !== id) {
      throw new APIException(HttpStatus.CONFLICT, '이미 사용중인 링크입니다.')
    }

    if (settings === 0 || settings === 1) {
      throw new APIException(HttpStatus.BAD_REQUEST, '잘못된 설정입니다.')
    }

    await this.settingsModel.create({
      guild: id,
      settings: settings,
      status: 1,
      link: link,
    })

    // TODO: 커스텀 도메인 기능 추가

    return true
  }

  async updateConfig(
    id: string,
    settings: number,
    link: string,
    // TODO: 커스텀 도메인 기능 추가 후 주석 해제
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    domain?: { domain: string; ssl: boolean },
  ): Promise<boolean> {
    const isLinkAlreadyUsing = await this.settingsModel
      .findOne()
      .where('link')
      .equals(link)

    if (isLinkAlreadyUsing && isLinkAlreadyUsing.guild !== id) {
      throw new APIException(HttpStatus.CONFLICT, '이미 사용중인 링크입니다.')
    }

    if (settings === 0 || settings === 1) {
      throw new APIException(HttpStatus.BAD_REQUEST, '잘못된 설정입니다.')
    }

    await this.settingsModel.updateOne(
      { guild: id },
      {
        guild: id,
        settings: settings,
        status: 1,
        link: link,
      },
    )

    // TODO: 커스텀 도메인 기능 추가

    return true
  }

  async removeConfig(id: string): Promise<boolean> {
    await this.settingsModel.deleteOne().where('guild').equals(id)
    return true
  }

  async isAlreadyUsingService(id: string): Promise<boolean> {
    const isAlreadyUsing = await this.settingsModel
      .findOne()
      .where('guild')
      .equals(id)

    return !!isAlreadyUsing
  }
}
