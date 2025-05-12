import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthHeaderComponent } from '@app/core/layouts/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-thankyou',
  standalone: true,
  imports: [AuthHeaderComponent, TranslatePipe, RouterModule],
  templateUrl: './thankyou.component.html',
  styleUrl: './thankyou.component.scss',
})
export class ThankyouComponent {}
