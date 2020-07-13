import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class SocketService extends Socket {
  constructor() {
    super({
      url: environment.WS_URL
    });
  }

  requestResponse(event: string, payload: any): Observable<any> {
    this.emit(event, payload);
    return this.fromEvent(event);
  }
}
