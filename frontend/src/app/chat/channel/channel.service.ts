import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Event, Channel, User } from '@shared-interfaces';
import { SocketService } from '../../core/sockets/socket.service';
import { UserService } from '../../core/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private _channel = new BehaviorSubject<Channel>(null);
  private _allChannels = new BehaviorSubject<Channel[]>([]);

  public readonly allChannels = this._allChannels.asObservable();
  public readonly channel = this._channel.asObservable();

  user: User;

  constructor(
    private socketService: SocketService,
    private userService: UserService
  ) {
    this.loadChannels();
    this.userService.user.subscribe(user => {
      this.user = user;
    });
  }

  loadChannels() {
    return this.socketService
      .fromEvent<Channel[]>(Event.CHANNELS)
      .subscribe(channels => {
        this._allChannels.next(channels);
      });
  }

  selectChannel(channel: Channel) {
    this._channel.next(channel);
  }

  addChannel(channelName: string) {
    this.socketService.emit(Event.ADD_CHANNEL, {
      channelName,
      user: this.user
    });
  }

  joinChannel(channel: string) {
    this.socketService.emit(Event.JOIN_CHANNEL, { channel });
  }

  sendTo(channel: string, message: string) {
    this.socketService.emit(Event.SEND_MESSAGE, {
      channel,
      message,
      user: this.user
    });
  }

  channels$() {
    return this.socketService.fromEvent<any[]>(Event.CHANNELS);
  }
}
