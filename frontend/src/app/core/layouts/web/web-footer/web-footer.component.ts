import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-web-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './web-footer.component.html',
  styleUrl: './web-footer.component.scss',
})
export class WebFooterComponent {}
