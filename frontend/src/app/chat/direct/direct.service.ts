import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Direct, Event } from '@shared-interfaces';

import { SocketService } from '../../core/sockets/socket.service';

@Injectable({
  providedIn: 'root'
})
export class DirectService {
  private _direct = new BehaviorSubject<Direct>(null);
  private _allDirects = new BehaviorSubject<Direct[]>([]);

  public readonly allDirects = this._allDirects.asObservable();
  public readonly direct = this._direct.asObservable();

  constructor(private socketService: SocketService) {
    this.loadDirects();
  }

  loadDirects() {
    return this.socketService
      .fromEvent<Direct[]>(Event.DIRECTS)
      .subscribe(directs => this._allDirects.next(directs));
  }

  selectDirect(direct: Direct) {
    this._direct.next(direct);
  }

  addDirect(user: string) {
    this.socketService.emit(Event.SEND_MESSAGE, { user });
  }

  sendTo(user: string, message: string) {
    this.socketService.emit(Event.SEND_MESSAGE, { user, message });
  }
}
