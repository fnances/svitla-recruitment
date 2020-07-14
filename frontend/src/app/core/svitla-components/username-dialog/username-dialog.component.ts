import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UserService } from '../../user/user.service';
import { User, HttpStatusCodes } from '@shared-interfaces';

@Component({
  selector: 'app-username-dialog',
  templateUrl: './username-dialog.component.html',
  styleUrls: ['./username-dialog.component.scss']
})
export class UsernameDialogComponent implements OnInit {
  username: FormControl;
  user: User;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsernameDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  ngOnInit(): void {
    let username = '';
    if (this.data.user) {
      this.user = this.data.user;
      username = this.data.user.username;
    }

    this.username = this.fb.control(username, [
      Validators.required,
      Validators.minLength(4)
    ]);
  }

  submit() {
    if (this.data.user) {
      this.edit();
    } else {
      this.confirm();
    }
  }

  edit() {
    const { username } = this;

    if (username.valid) {
      this.userService.editUser(username.value).subscribe(updatedUser => {
        this.userService.saveUser(updatedUser);
        this.dialogRef.close();
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    const { username } = this;
    if (username.valid) {
      this.userService
        .simpleLogIn(username.value)
        .subscribe(({ error, code, user }) => {
          if (!error) {
            return this.dialogRef.close(user);
          }
          if (code === HttpStatusCodes.CONFLICT) {
            this.username.setErrors({ taken: true });
          } else {
            return this.username.setErrors({ generalError: true });
          }
        });
    }
  }
}
