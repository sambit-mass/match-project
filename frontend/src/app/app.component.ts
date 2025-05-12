import { Component, Inject, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { appSettings } from './config';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public subscriptions: Subscription[] = [];
  private default_language_key: string = appSettings.default_language;
  constructor(
    private _renderer: Renderer2,
    private _translate: TranslateService,
    private _cookieService: CookieService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    /* Set default language */
    this._translate.addLangs(['en', 'zh']);
    this._translate.setDefaultLang('en');

    // Initial set default body class
    this.setBodyClass(this._translate.currentLang || 'en');

    const selectedLanguage = this._cookieService.get(this.default_language_key) as string;
    // set language in cookie
    if (!selectedLanguage) {
      this._translate.use('en');
      this._cookieService.set(this.default_language_key, 'en', {
        path: '/',
      });
    } else {
      this._translate.use(selectedLanguage);
    }

    // Listen for language changes
    this._translate.onLangChange.subscribe(event => {
      this.setBodyClass(event.lang);
    });
  }

  setBodyClass(lang: string) {
    const body = this._document.body;

    // Remove all lang-* classes
    body.classList.forEach(className => {
      if (className.startsWith('lang-')) {
        this._renderer.removeClass(body, className);
      }
    });

    // Add new lang class
    this._renderer.addClass(body, `lang-${lang}`);
  }
}
