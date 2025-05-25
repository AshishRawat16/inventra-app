// websocket.service.ts
import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket$: any;

  constructor() { }

  // Connect to WebSocket server
  connect(url: string): Observable<any> {
    this.socket$ = webSocket(url);
    return this.socket$;
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  // Send data through WebSocket
  send(data: any): void {
    if (this.socket$) {
      this.socket$.next(data);
    }
  }
}
