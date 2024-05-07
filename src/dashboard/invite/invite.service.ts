import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { Koreanbots } from 'koreanbots';
import { Model } from 'mongoose';

import { type APIUser } from 'discord-api-types/v10';

import { inviteConfigDto } from './dto/inviteConfig.dto';
import { APIException } from 'src/common/dto/APIException.dto';

import { ISettings } from 'src/repository/schemas/settings.schema';
import { IEnterprise } from 'src/repository/schemas/enterprise.schema';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  private readonly koreanbotsClient = new Koreanbots({
    clientID: process.env.DISCORD_CLIENT_ID,
    api: {
      token: process.env.KOREANBOTS_TOKEN,
    },
  });

  constructor(
    @Inject('SETTINGS_MODEL')
    private readonly settingsModel: Model<ISettings>,
    @Inject('ENTERPRISE_MODEL')
    private readonly enterpriseModel: Model<IEnterprise>,
  ) {}

  async getCurrentConfig(id: string, user: APIUser): Promise<inviteConfigDto> {
    const settings = await this.settingsModel
      .findOne()
      .where('guild')
      .equals(id);

    const payData = await this.enterpriseModel
      .findOne()
      .where('guild')
      .equals(id);

    const koreanbotsVoteData = await this.koreanbotsClient.mybot.checkVote(
      user.id,
    );

    // TODO: 커스텀 도메인 기능 추가

    if (payData) {
      let premiumType: number = 0;
      let period: number = -1;

      switch (payData.billingType) {
        case 0:
          period = 1;
          premiumType = 1;
          break;
        case 1:
          period = 3;
          premiumType = 1;
          break;
        case 2:
          period = 1;
          premiumType = 2;
          break;
        case 3:
          premiumType = 2;
          period = 3;
          break;
      }

      const expDate = new Date(payData.date);
      expDate.setDate(expDate.getDate() + period);

      if (expDate.getTime() >= Date.now()) {
        return {
          settings: settings,
          koreanbots: { voted: true, lastVote: 0 },
          premiumType: premiumType,
          domain: null,
        };
      }
    }

    return {
      settings: settings,
      koreanbots: koreanbotsVoteData,
      premiumType: 0,
      domain: null,
    };
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
      .equals(link);

    if (isLinkAlreadyUsing && isLinkAlreadyUsing.guild !== id) {
      throw new APIException(HttpStatus.CONFLICT, '이미 사용중인 링크입니다.');
    }

    if (settings === 0 || settings === 1) {
      throw new APIException(HttpStatus.BAD_REQUEST, '잘못된 설정입니다.');
    }

    await this.settingsModel.create({
      guild: id,
      settings: settings,
      status: 1,
      link: link,
    });

    // TODO: 커스텀 도메인 기능 추가

    return true;
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
      .equals(link);

    if (isLinkAlreadyUsing && isLinkAlreadyUsing.guild !== id) {
      throw new APIException(HttpStatus.CONFLICT, '이미 사용중인 링크입니다.');
    }

    if (settings === 0 || settings === 1) {
      throw new APIException(HttpStatus.BAD_REQUEST, '잘못된 설정입니다.');
    }

    await this.settingsModel.updateOne(
      { guild: id },
      {
        guild: id,
        settings: settings,
        status: 1,
        link: link,
      },
    );

    // TODO: 커스텀 도메인 기능 추가

    return true;
  }

  async removeConfig(id: string): Promise<boolean> {
    await this.settingsModel.deleteOne().where('guild').equals(id);
    return true;
  }

  async isAlreadyUsingService(id: string): Promise<boolean> {
    const isAlreadyUsing = await this.settingsModel
      .findOne()
      .where('guild')
      .equals(id);

    return !!isAlreadyUsing;
  }
}
