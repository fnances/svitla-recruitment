import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SocketService } from '../sockets/socket.service';

import { User, Event } from 'shared-interfaces/lib';

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
      this._user$.next(authenticated);
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

  resetMention(user: User) {
    this._mentioned$.next(null);
  }

  simpleLogIn(username: string): Observable<any> {
    this.socketService.emit(Event.ADD_USER, username);
    return this.socketService.fromEvent(Event.ADD_USER).pipe(
      tap(payload => {
        if (payload.success) {
          this.saveUser(payload.user);
          this._user$.next(payload.user);
        }

        if (payload.code === 404) {
          this.clearUser();
          this._user$.next(null);
        }
      })
    );
  }

  simpleLogOut() {
    this.clearUser();
    this._user$.next(null);
  }

  editUser(id: string, username: string): Observable<User> {
    return this.socketService.requestResponse(Event.EDIT_USER, {
      id,
      username
    });
  }

  getUser() {
    return JSON.parse(localStorage.getItem('AUTH'));
  }

  saveUser(user: User) {
    const parsed = JSON.stringify(user);
    localStorage.setItem('AUTH', parsed);
    document.cookie = `user=${parsed}; path=/;`;
  }

  clearUser() {
    localStorage.removeItem('AUTH');
    document.cookie = null;
  }

  auth$() {
    return this.socketService.fromEvent<{ code: number }>(Event.AUTH);
  }

  users$(): Observable<User[]> {
    return this.socketService.fromEvent<User[]>(Event.USERS);
  }
}
