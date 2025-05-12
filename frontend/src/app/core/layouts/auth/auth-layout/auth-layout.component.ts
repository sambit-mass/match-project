import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthFooterComponent } from '../auth-footer/auth-footer.component';

@Component({
  selector: 'auth-layout',
  standalone: true,
  imports: [RouterModule, AuthFooterComponent],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
})
export class AuthLayoutComponent {}
