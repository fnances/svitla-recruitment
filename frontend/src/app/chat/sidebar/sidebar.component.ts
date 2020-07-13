import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { combineLatest } from 'rxjs';
import { User, Channel } from '@shared-interfaces';

import { ChannelService } from '../channel/channel.service';
import { UserService } from '../../core/user/user.service';
import { DirectService } from '../direct/direct.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(
    private userService: UserService,
    private channelService: ChannelService,
    private directService: DirectService,
    private router: Router
  ) {}

  searchValue = [];

  users: User[] = [];
  channels: Channel[] = [];
  directs = [];

  ngOnInit(): void {
    combineLatest([
      this.userService.allUsers,
      this.channelService.allChannels
    ]).subscribe(([users, channels]) => {
      this.users = users;
      this.channels = channels;
    });
  }

  selectUser(user: User) {
    this.userService.mention(user);
  }

  selectChannel(channel: Channel) {
    this.channelService.selectChannel(channel);
    this.router.navigate(['channel', channel.id]);
  }

  addChannel(channelName: string) {
    const exists = this.channels.some(({ name }) => name === channelName);
    if (!exists) {
      this.channelService.addChannel(channelName);
    }
  }

  addDirect(direct: string) {
    const exists = this.directs.some(({ name }) => name === direct);
    if (!exists) {
      this.directService.addDirect(direct);
    }
  }
}
