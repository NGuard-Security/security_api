import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { IPush } from 'src/repository/schemas/push.schema';

const pushKindTempENUM = {
  emerg: 0,
  danger: 1,
  warning: 2,
  success: 3,
  alert: 4,
} as const;

@Injectable()
export class PushService {
  constructor(@Inject('PUSH_MODEL') private readonly pushModel: Model<IPush>) {}

  async getPushArray(guildId: string, alreadyPushIdArray: number[]) {
    const pushArray = await this.pushModel.find({
      $or: [{ guild: guildId }, { guild: 'global' }],
      due: { $gt: Date.now() },
      id: { $nin: alreadyPushIdArray },
    });

    pushArray.sort((push) => pushKindTempENUM[push.kind] || 5);

    return pushArray;
  }
}
