import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private hubConnection: signalR.HubConnection;
  apiUrl:string = "https://localhost:7228/";
  constructor() {
    Object.defineProperty(WebSocket, 'OPEN', { value: 1, });
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl + 'realtimehub', {
      // skipNegotiation: true,  // skipNegotiation as we specify WebSockets
      // transport: signalR.HttpTransportType.WebSockets,  // force WebSocket transport
      withCredentials: false
    }).build();
  }

  startConnection(): Observable<void> {
    return new Observable<void>((observer) => {
      this.hubConnection
        .start()
        .then(() => {
          console.log('Connection established with SignalR hub');
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          console.error('Error connecting to SignalR hub:', error);
          observer.error(error);
        });
    });
  }

  receiveMessage(): Observable<string> {
    return new Observable<string>((observer) => {
      this.hubConnection.on('ReceiveMessage', (message: string) => {
        observer.next(message);
      });
    });
  }

  sendMessage(message: string): void {
    this.hubConnection.invoke('SendMessage', message);
  }
}