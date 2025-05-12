import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2 } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private style!: HTMLLinkElement;
  private cssFile: string = '';
  private themeCssId: string = 'themeCSS';
  constructor(@Inject(DOCUMENT) private document: Document) {}

  setTheme(theme: string, renderer2: Renderer2) {
    /* Remove existing theme class */
    if (this.document.body.classList[1]) {
      this.document.body.classList.remove(this.document.body.classList[1]);
    }

    /*Add body class */
    this.document.body.classList.add(theme);
    this.cssFile = `assets/scss/theme/${theme}.scss`;

    // this.getCssDirectory(`assets/scss/theme/${theme}.scss`).then(res => {
    //   if (!res) {
    //     /*Add Default body class */
    //     this.document.body.classList.add(
    //       environment.defaultDomainDetails.theme_setting.theme_color
    //     );
    //     //set default theme If not found files
    //     this.cssFile = `assets/scss/theme/${environment.defaultDomainDetails.theme_setting.theme_color}.scss`;
    //   }

    //   this.removeExistingThemeStyle(renderer2, this.themeCssId);

    //   // Create a link element via Angular's renderer to avoid troubles
    //   this.style = renderer2.createElement('link') as HTMLLinkElement;

    //   // Set type of the link item and path to the css file
    //   renderer2.setProperty(this.style, 'rel', 'stylesheet');
    //   renderer2.setProperty(this.style, 'href', this.cssFile);
    //   renderer2.setProperty(this.style, 'id', this.themeCssId);

    //   // Add the style to the head section
    //   renderer2.appendChild(this.document.head, this.style);
    // });
  }

  removeExistingThemeStyle(renderer2: Renderer2, themeCssId: string) {
    const themeIdHtmlElement = this.document.getElementById(themeCssId);
    if (themeIdHtmlElement) {
      renderer2.removeChild(this.document.head, themeIdHtmlElement);
    }
  }

  /* Check theme wise files exist or not */
  async getCssDirectory(dirname: string) {
    const response = await fetch(dirname);
    const text = await response.text();
    return !text.includes('<!doctype html>');
  }
}
