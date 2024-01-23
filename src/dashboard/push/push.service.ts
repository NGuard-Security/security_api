import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { IPush } from 'src/repository/schemas/push.schema';

@Injectable()
export class PushService {
  constructor(@Inject() private readonly pushModel: Model<IPush>) {}

  async getPushArray(guildId: string, isAlready: boolean) {
    const guildPushArray = await this.pushModel.find({
      guild: guildId,
      id: { $nin: isAlready },
      due: { $gt: new Date().getTime() },
    });
    const globalPushArray = await this.pushModel.find({
      guild: 'global',
      id: { $nin: isAlready },
      due: { $gt: new Date().getTime() },
    });

    const pushArray = [].concat(guildPushArray, globalPushArray);

    pushArray.sort((push) => {
      switch (push.kind) {
        case 'emerg':
          return 0;
        case 'danger':
          return 1;
        case 'warning':
          return 2;
        case 'success':
          return 3;
        case 'alert':
          return 4;
      }
    });

    return pushArray;
  }
}
