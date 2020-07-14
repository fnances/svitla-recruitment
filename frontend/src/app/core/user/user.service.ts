import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, flatMap, map } from 'rxjs/operators';

import { SocketService } from '../sockets/socket.service';

import { User, Event } from 'shared-interfaces/lib';

export interface SimpleLogInPayload {
  success?: boolean;
  error?: boolean;
  code?: number;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  _mentioned$ = new BehaviorSubject<User>(null);
  _user$ = new BehaviorSubject<User>(null);
  _allUsers$ = new BehaviorSubject<User[]>([]);

  user = this._user$.asObservable();
  mentioned = this._mentioned$.asObservable();
  allUsers = this._allUsers$.asObservable();

  constructor(private socketService: SocketService) {
    const authenticated = this.getUser();
    if (authenticated) {
      this.saveUser(authenticated);
    } else if (authenticated === undefined) {
      this.clearUser();
    }

    this.loadUsers();
  }

  loadUsers() {
    return this.socketService
      .fromEvent<User[]>(Event.USERS)
      .subscribe(users => this._allUsers$.next(users));
  }

  mention(user: User) {
    this._mentioned$.next(user);
  }

  resetMention() {
    this._mentioned$.next(null);
  }

  simpleLogIn(username: string): Observable<SimpleLogInPayload> {
    this.socketService.emit(Event.ADD_USER, username);
    return this.socketService
      .fromEvent<SimpleLogInPayload>(Event.ADD_USER)
      .pipe(
        tap(payload => {
          if (payload.success) {
            this.saveUser(payload.user);
          }

          if (payload.code === 404) {
            this.clearUser();
          }
        })
      );
  }

  simpleLogOut() {
    this.clearUser();
    this._user$.next(null);
    this.socketService.emit(Event.DISCONNECTED);
  }

  editUser(username: string): Observable<User> {
    return this.socketService.requestResponse(Event.EDIT_USER, {
      username,
      user: this._user$.value
    });
  }

  getUser() {
    return JSON.parse(localStorage.getItem('AUTH'));
  }

  saveUser(user: User) {
    const parsed = JSON.stringify(user);
    localStorage.setItem('AUTH', parsed);
    document.cookie = `user=${parsed}; path=/;`;
    this._user$.next(user);
  }

  clearUser() {
    localStorage.removeItem('AUTH');
    document.cookie = `user=; path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    this._user$.next(null);
  }

  auth$() {
    return this.socketService.fromEvent<{ code?: number; user?: User }>(
      Event.AUTH
    );
  }

  users$(): Observable<User[]> {
    return this.socketService.fromEvent<User[]>(Event.USERS);
  }
}
