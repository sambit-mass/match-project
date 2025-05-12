// import { Injectable } from '@angular/core';
// import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
// import { Observable, Subscriber } from 'rxjs';
// import { environment } from '@env/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketIOService {
//   private socketIO!: Socket;

//   get getSocketIO() {
//     return this.socketIO;
//   }

//   connectSocketIO(URL?: string, option?: Partial<ManagerOptions & SocketOptions>) {
//     this.socketIO = io(
//       URL ? URL : environment.host.replace('/v1', ''),
//       option !== undefined
//         ? option
//         : {
//             upgrade: false,
//             transports: ['websocket'],
//           }
//     );
//   }

//   socketIOEmit(event: string, ...args: any[]) {
//     this.socketIO.emit(event, ...args);
//   }

//   socketIOListen(event: string): Observable<any> {
//     return new Observable((observer: Subscriber<any>) => {
//       this.socketIO.on(event, data => {
//         observer.next(data);
//       });
//     });
//   }

//   disconnectSocketIO() {
//     this.socketIO.disconnect();
//   }
// }
