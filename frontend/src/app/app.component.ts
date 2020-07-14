import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { UsernameDialogComponent } from './core/svitla-components/username-dialog/username-dialog.component';

import { UserService } from './core/user/user.service';
import { ChannelService } from './chat/channel/channel.service';

import { User, HttpStatusCodes } from '@shared-interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  user$: User;

  constructor(
    private dialogService: MatDialog,
    private userService: UserService,
    private channelService: ChannelService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.user.subscribe(user => {
      this.user$ = user;
      if (user) {
        return;
      }
      this.router.navigate(['/']);
      this.openModal();
    });

    this.userService.auth$().subscribe(({ code, user }) => {
      if (code === HttpStatusCodes.UNAUTHORIZED) {
        this.userService.simpleLogOut();
      }

      if (user) {
        this.userService.saveUser(user);
      }
    });
  }

  ngOnDestroy() {}

  logOut() {
    this.userService.simpleLogOut();
  }

  editUser() {
    this.openModal({ user: this.user$ });
  }

  openModal(data?: { user: User }) {
    this.dialogService.closeAll();

    const ref = this.dialogService.open(UsernameDialogComponent, {
      disableClose: !this.user$,
      data: {
        user: this.user$,
        ...data
      }
    });

    return ref.afterClosed();
  }
}
