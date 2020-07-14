import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from '../channel/channel.service';
import { map } from 'rxjs/operators';
import { Message } from '@shared-interfaces';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  messages: Message[];

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(({ channelId }) => {
      this.channelService.allChannels
        .pipe(
          map(channels => channels.filter(channel => channel.id === channelId))
        )
        .subscribe(([channel]) => {
          if (!channel) {
            return;
          }
          this.messages = channel.messages;
        });
    });
  }
}
