import { Component, OnInit } from '@angular/core';

import { ChannelService } from './channel/channel.service';
import { UserService } from '../core/user/user.service';
import { Channel, Message } from '@shared-interfaces';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  mention$ = this.userService.mentioned;

  channel: Channel;

  constructor(
    private userService: UserService,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.channelService.channel.subscribe(channel => {
      this.channel = channel;
    });
  }

  sendMessage(val: string) {
    this.channelService.sendTo(this.channel.id, val);
  }
}
