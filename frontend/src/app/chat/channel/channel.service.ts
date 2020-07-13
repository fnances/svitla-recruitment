import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Event, Channel } from '@shared-interfaces';
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

  constructor(
    private socketService: SocketService,
    private userService: UserService
  ) {
    this.loadChannels();
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
    this.socketService.emit(Event.ADD_CHANNEL, { channelName });
  }

  joinChannel(channel: string) {
    this.socketService.emit(Event.JOIN_CHANNEL, { channel });
  }

  sendTo(channel: string, message: string) {
    this.socketService.emit(Event.SEND_MESSAGE, { channel, message });
  }

  channels$() {
    return this.socketService.fromEvent<any[]>(Event.CHANNELS);
  }
}
