import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AuthGuard } from '../auth/auth.guard';
import { Socket } from 'socket.io';
import { PushService } from './push.service';

// @ApiBearerAuth()
@WebSocketGateway(8080, { cors: { credentials: false } })
export class PushGateway {
  constructor(private readonly pushService: PushService) {}

  // @UseGuards(AuthGuard)
  @SubscribeMessage('push:check')
  async handlePushCheck(
    @MessageBody() body: { guild: string; already: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const pushArray = this.pushService.getPushArray(body.guild, body.already);
    client.emit('push:check', pushArray);
  }

  // @UseGuards(AuthGuard)
  @SubscribeMessage('push:load')
  async handlePushLoad(
    @MessageBody() body: { guild: string },
    @ConnectedSocket() client: Socket,
  ) {
    const pushArray = this.pushService.getPushArray(body.guild, false);
    client.emit('push:check', pushArray);
  }
}
