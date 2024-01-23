import { Injectable } from '@nestjs/common';

@Injectable()
export class PushService {
  constructor() {} // private readonly alarmModel: Model<>, // @Inject()

  async getPushArray(guildId: string, isAlready: boolean) {
    // const guildPushArray = await this.alarmModel.find({
    //   guild: guildId,
    //   id: { $nin: isAlreadyOrFalse },
    //   due: { $gt: new Date().getTime() },
    // });
    // const globalPushArray = await this.alarmModel.find({
    //   guild: 'global',
    //   id: { $nin: isAlreadyOrFalse },
    //   due: { $gt: new Date().getTime() },
    // });
    if (isAlready) {
    }
    // const pushArray = [].concat(guildPushArray, globalPushArray);
    const pushArray = [].concat();

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
