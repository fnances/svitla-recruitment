import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuillModule } from 'ngx-quill';

import { NgMaterialModule } from './ng-material/ng-material.module';
import { SvitlaComponentsModule } from './svitla-components/svitla-components.module';
import { SocketService } from './sockets/socket.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, NgMaterialModule, SvitlaComponentsModule],
  providers: [SocketService],
  exports: [NgMaterialModule, SvitlaComponentsModule]
})
export class CoreModule {}
