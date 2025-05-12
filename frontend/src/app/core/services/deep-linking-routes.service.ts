import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root',
})
export class DeepLinkingRoutesService {
  private routes: IDeepLinkingDetails[] = [
    {
      user_type: '',
      need_to_login: 1,
      route_identification: 1001,
      route_value: 'clients/client-order-list',
      route_description: 'client list > order list',
      route_details: {
        customer_code: '',
        selected_tabs: 1,
      },
    },
  ];

  constructor(
    private _router: Router,
    private _encryptionService: EncryptionService
  ) {}

  public createDeepLinkURL(data: IDeepLinkingDetails, redirectionRequired = true) {
    let redirectionDetails = { path: '', fragment: '' };
    const deepLinkDetails = this.routes.find(
      route => route.route_identification == data.route_identification
    );
    if (deepLinkDetails) {
      redirectionDetails = {
        path: deepLinkDetails.route_value,
        fragment: encodeURIComponent(this._encryptionService.encryptUsingAES256(data)),
      };
      if (redirectionRequired)
        this._router.navigate([deepLinkDetails.route_value], {
          fragment: encodeURIComponent(this._encryptionService.encryptUsingAES256(data)),
        });
      return redirectionDetails;
    }
    if (redirectionRequired) this._router.navigate(['/']);
    return redirectionDetails;
  }
}
