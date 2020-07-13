import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { QuillModule } from 'ngx-quill';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { CoreModule } from '../core/core.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MessageFieldComponent } from './message-field/message-field.component';
import { MessageComponent } from './message/message.component';
import { ChannelService } from './channel/channel.service';
import { DirectService } from './direct/direct.service';

@NgModule({
  declarations: [
    ChatComponent,
    SidebarComponent,
    MessageFieldComponent,
    MessageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChatRoutingModule,
    CoreModule,
    QuillModule.forRoot()
  ],
  providers: [ChannelService, DirectService]
})
export class ChatModule {}
