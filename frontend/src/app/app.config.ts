import { routes } from './app.routes';
import { provideStore } from '@ngxs/store';
import { provideToastr } from 'ngx-toastr';
import { environment } from '@env/environment';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  httpErrorInterceptor,
  httpAuthHeaderInterceptor,
  httpSuccessHandlerInterceptorFn,
} from './core/interceptors';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, 'i18n/', '.json');

//Store import
import { RegistrationState } from './store';
import { StyleRenderer, LyTheme2, LY_THEME_NAME, LY_THEME } from '@alyle/ui';
import { MinimaLight } from '@alyle/ui/themes/minima';
import { ProfileState } from './store/states/profile.state';

const STATES = [RegistrationState, ProfileState];

export const appConfig: ApplicationConfig = {
  providers: [
    TranslatePipe,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideAnimationsAsync(),
    StyleRenderer,
    LyTheme2,
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true },
    // manually added providers
    provideToastr({
      timeOut: 3000,
      closeButton: true,
      positionClass: 'toast-top-right',
    }),
    provideHttpClient(
      withInterceptors([
        httpErrorInterceptor,
        httpAuthHeaderInterceptor,
        httpSuccessHandlerInterceptorFn,
      ])
    ),
    importProvidersFrom([
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ]),
    provideStore([...STATES], withNgxsLoggerPlugin({ disabled: environment.production })),
  ],
};
