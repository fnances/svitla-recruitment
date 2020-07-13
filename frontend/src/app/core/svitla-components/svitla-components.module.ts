import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NgMaterialModule } from '../ng-material/ng-material.module';

import { UsernameDialogComponent } from './username-dialog/username-dialog.component';
import { InlineInputComponent } from './inline-input/inline-input.component';

@NgModule({
  declarations: [UsernameDialogComponent, InlineInputComponent],
  imports: [CommonModule, ReactiveFormsModule, NgMaterialModule],
  exports: [UsernameDialogComponent, InlineInputComponent]
})
export class SvitlaComponentsModule {}
