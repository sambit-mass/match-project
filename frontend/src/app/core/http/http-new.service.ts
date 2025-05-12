// import { Observable } from 'rxjs';
// import { Injectable } from '@angular/core';
// import { environment } from '@env/environment';
// import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// interface IRequestOptions {
//   observe?: 'body';
//   params?: HttpParams;
//   headers?: HttpHeaders;
//   responseType?: 'json';
//   reportProgress?: boolean;
//   withCredentials?: boolean;
// }

// interface IRequestParams {
//   [key: string]: string | string[] | Record<string, string>;
// }

// interface IRequestConfig {
//   body?: any;
//   urlPrefix: boolean;
//   headers: Record<string, string>;
//   params: IRequestParams | undefined;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class HttpService {
//   constructor(private http: HttpClient) {}

//   private apiUrl: string = environment.host;

//   /**
//    * *Makes an HTTP GET request.
//    *
//    * @param {string} path - The URL path.
//    * @param {any} params - The query parameters.
//    * @param {boolean} urlPrefix - prefix for the url.
//    * @param {Record<string, string>} headers - The request headers.
//    * @returns An observable of the HTTP response.
//    *
//    * @developer Abhisek Dhua
//    */
//   public get(
//     path: string,
//     params?: IRequestParams,
//     urlPrefix = true,
//     headers: Record<string, string> = {}
//   ): Observable<any> {
//     const { url, options } = this.getUrlAndOptions(path, {
//       params,
//       headers,
//       urlPrefix,
//     });
//     return this.http.get<any>(url, options);
//   }

//   /**
//    * *Makes an HTTP POST request.
//    *
//    * @param {string} path - The URL path.
//    * @param {any} body - The request body.
//    * @param {any} params - The query parameters.
//    * @param {boolean} urlPrefix - prefix for the url.
//    * @param {Record<string, string>} headers - The request headers.
//    * @returns An observable of the HTTP response.
//    *
//    * @developer Abhisek Dhua
//    */
//   public post(
//     path: string,
//     body: any,
//     params?: IRequestParams,
//     urlPrefix = true,
//     headers: Record<string, string> = {}
//   ): Observable<any> {
//     const { url, options } = this.getUrlAndOptions(path, {
//       body,
//       params,
//       headers,
//       urlPrefix,
//     });
//     return this.http.post<any>(url, body, options);
//   }

//   /**
//    * *Makes an HTTP PUT request.
//    *
//    * @param {string} path - The URL path.
//    * @param {any} body - The request body.
//    * @param {any} params - The query parameters.
//    * @param {boolean} urlPrefix - prefix for the url.
//    * @param {Record<string, string>} headers - The request headers.
//    * @returns An observable of the HTTP response.
//    *
//    * @developer Abhisek Dhua
//    */
//   public put(
//     path: string,
//     body: any,
//     params?: IRequestParams,
//     urlPrefix = true,
//     headers: Record<string, string> = {}
//   ): Observable<any> {
//     const { url, options } = this.getUrlAndOptions(path, {
//       body,
//       params,
//       headers,
//       urlPrefix,
//     });
//     return this.http.put<any>(url, body, options);
//   }

//   /**
//    * *Makes an HTTP PATCH request.
//    *
//    * @param {string} path - The URL path.
//    * @param {any} body - The request body.
//    * @param {any} params - The query parameters.
//    * @param {boolean} urlPrefix - prefix for the url.
//    * @param {Record<string, string>} headers - The request headers.
//    * @returns An observable of the HTTP response.
//    *
//    * @developer Abhisek Dhua
//    */
//   public patch(
//     path: string,
//     body: any,
//     params?: IRequestParams,
//     urlPrefix = true,
//     headers: Record<string, string> = {}
//   ): Observable<any> {
//     const { url, options } = this.getUrlAndOptions(path, {
//       body,
//       params,
//       headers,
//       urlPrefix,
//     });
//     return this.http.patch<any>(url, body, options);
//   }

//   /**
//    * *Makes an HTTP DELETE request.
//    *
//    * @param {string} path - The URL path.
//    * @param {any} params - The query parameters.
//    * @param {boolean} urlPrefix - prefix for the url.
//    * @param {Record<string, string>} headers - The request headers.
//    * @returns An observable of the HTTP response.
//    *
//    * @developer Abhisek Dhua
//    */
//   public delete(
//     path: string,
//     params?: IRequestParams,
//     urlPrefix = true,
//     headers: Record<string, string> = {}
//   ): Observable<any> {
//     const { url, options } = this.getUrlAndOptions(path, {
//       params,
//       headers,
//       urlPrefix,
//     });
//     return this.http.delete<any>(url, options);
//   }

//   /**
//    * * Constructs the URL and request options objects using the provided path, parameters, headers, and body.
//    *
//    * @param {string} path - The URL path.
//    * @param {IRequestConfig} config - The config object to be used in the request.
//    * @returns An object containing the URL and options objects.
//    *
//    * @developer Abhisek Dhua
//    */
//   private getUrlAndOptions(
//     path: string,
//     config: IRequestConfig
//   ): { url: string; options: IRequestOptions } {
//     const url = this.getUrl(path, config.urlPrefix);
//     const httpParams = this.getHttpParams(config.params);
//     const httpHeaders = this.getHttpHeaders(config.headers);

//     const options: IRequestOptions = {
//       headers: httpHeaders,
//       params: httpParams,
//       observe: 'body',
//     };

//     if (config.body instanceof FormData) {
//       options.reportProgress = true;
//     }

//     return { url, options };
//   }

//   /**
//    * *Constructs the URL using the provided path and API URL prefix.
//    *
//    * @param {string} path - The URL path.
//    * @param {boolean} urlPrefix - prefix for the url.
//    * @returns The constructed URL.
//    *
//    * @developer Abhisek Dhua
//    */
//   private getUrl(path: string, urlPrefix = true): string {
//     return urlPrefix ? `${this.apiUrl}/${path}` : `${path}`;
//   }

//   /**
//    * *Constructs an instance of HttpHeaders using the provided headers.
//    *
//    * @param {Record<string, string>} headers - The headers to be used in the request.
//    * @returns The instance of HttpHeaders.
//    *
//    * @developer Abhisek Dhua
//    */
//   private getHttpHeaders(headers: Record<string, string>): HttpHeaders {
//     const httpHeaders = new HttpHeaders();
//     for (const [key, value] of Object.entries(headers)) {
//       if (value !== null) {
//         httpHeaders.set(key, value);
//       }
//     }
//     return httpHeaders;
//   }

//   /**
//    * *Constructs an instance of HttpParams using the provided parameters.
//    *
//    * @param {IRequestParams} params - The parameters to be used in the request.
//    * @returns The instance of HttpParams.
//    *
//    * @developer Abhisek Dhua
//    */
//   private getHttpParams(params?: IRequestParams): HttpParams {
//     let httpParams = new HttpParams();
//     if (params) {
//       Object.keys(params).forEach(key => {
//         const value = params[key];
//         if (Array.isArray(value)) {
//           value.forEach((val: string) => {
//             httpParams = httpParams.append(`${key}[]`, val);
//           });
//         } else if (typeof value === 'object') {
//           Object.keys(value).forEach(nestedKey => {
//             httpParams = httpParams.append(`${key}[${nestedKey}]`, value[nestedKey]);
//           });
//         } else {
//           httpParams = httpParams.append(key, value);
//         }
//       });
//     }
//     return httpParams;
//   }
// }
