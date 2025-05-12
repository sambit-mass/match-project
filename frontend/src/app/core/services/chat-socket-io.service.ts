import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatSocketIoService {
  private socket: Socket;
  private tokenSubject = new Subject<string>();
  public completeBotReply = new Subject<boolean>();
  private errorSubject = new Subject<string>();

  constructor() {
    this.socket = io(environment.socketConnect);
    this.connect();
  }
  connect() {
    this.socket.on('connect', () => {});
    this.socket.on('llm_response_token', (botReply: string) => {
      this.tokenSubject.next(botReply);
    });
    this.socket.on('llm_response_end', (end: boolean) => {
      this.completeBotReply.next(end);
    });
    this.socket.on('error', (error: any) => {
      this.errorSubject.next(error);
    });
  }

  endResponse(): Observable<boolean> {
    return this.completeBotReply.asObservable();
  }

  onToken(): Observable<string> {
    return this.tokenSubject.asObservable();
  }

  sendMessage(message: string) {
    this.socket.emit('user_message', { message });
  }

  error(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
