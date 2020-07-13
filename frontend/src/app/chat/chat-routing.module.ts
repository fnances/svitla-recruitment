import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatComponent } from './chat.component';
import { MessageComponent } from './message/message.component';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent,
    children: [
      {
        path: 'channel/:channelId',
        component: MessageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule {}
