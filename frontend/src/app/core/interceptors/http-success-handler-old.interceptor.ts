// import {
//   HttpEvent,
//   HttpRequest,
//   HttpResponse,
//   HttpHandlerFn,
//   HttpInterceptorFn,
// } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { map, Observable } from 'rxjs';
// import { environment } from '@env/environment';
// import { EncryptionService } from '../services/encryption.service';

// export const httpSuccessHandlerInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<unknown>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<unknown>> => {
//   const _encryptionService = inject(EncryptionService);
//   const encryptedRequest = environment?.encryption.encryptedRequest ?? false;

//   if (
//     encryptedRequest &&
//     !(req.body instanceof FormData) &&
//     (req.body as { [key: string]: any })['enc_data'] === undefined
//   ) {
//     // encrypt request before api call depending on environment setup
//     (req.body as { [key: string]: any }) = {
//       enc_data: _encryptionService.encryptUsingAES256(
//         req.body as { [key: string]: any }
//       ),
//     };
//   }

//   /* Intercepting success requests */
//   return next(req).pipe(
//     map((response: HttpEvent<any>) => {
//       if (response instanceof HttpResponse) {
//         const statusCode: number = response['status'];
//         const responseObject = response.body;
//         responseObject.status = statusCode;
//         // decrypt response before subscribe if response was encrypted
//         if (
//           response.body.response !== undefined &&
//           response.body.response.data !== undefined &&
//           response.body.response.data['enc_data'] !== undefined &&
//           typeof response.body.response.data['enc_data'] === 'string'
//         ) {
//           responseObject.response = {
//             ...response.body.response,
//             data: _encryptionService.decryptUsingAES256(
//               response.body.response.data['enc_data']
//             ),
//           };
//           // log encrypted response in development mode
//           if (!environment.production) {
//             console.log(
//               `ENCRYPTED RESPONSE (${req.url}) => `,
//               responseObject.response
//             );
//           }
//         }
//       }
//       return response;
//     })
//   );
// };
