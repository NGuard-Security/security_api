import { UseGuards } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { AuthGuard } from '../auth/auth.guard';
import { PushService } from './push.service';

// @ApiBearerAuth()
@WebSocketGateway(8080, { cors: { credentials: false } })
export class PushGateway {
  constructor(private readonly pushService: PushService) {}

  @UseGuards(AuthGuard)
  @SubscribeMessage('push:check')
  async handlePushCheck(
    @MessageBody() body: { guildId: string; alreadyPushIdArray: number[] },
    @ConnectedSocket() client: Socket,
  ) {
    const pushArray = this.pushService.getPushArray(
      body.guildId,
      body.alreadyPushIdArray,
    );

    client.emit('push:check', pushArray);
  }

  @UseGuards(AuthGuard)
  @SubscribeMessage('push:load')
  async handlePushLoad(
    @MessageBody() body: { guildId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const pushArray = this.pushService.getPushArray(body.guildId, []);

    client.emit('push:check', pushArray);
  }
}
