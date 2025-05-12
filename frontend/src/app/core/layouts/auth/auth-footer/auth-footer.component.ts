import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-footer',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './auth-footer.component.html',
  styleUrl: './auth-footer.component.scss',
})
export class AuthFooterComponent {
  @ViewChild('termsConditionDialog') termsCondition = {} as TemplateRef<string>;
  public activeTab = 'tab1';
  dialogRef!: MatDialogRef<string, TemplateRef<Element>>;

  constructor(public _dialog: MatDialog) {}

  openTermsPrivacyDialog(type: string) {
    this.activeTab = type;
    this.dialogRef = this._dialog.open(this.termsCondition, {
      panelClass: 'custom-termscondition-dialog',
      backdropClass: 'customTermsDialogBackdrop',
      hasBackdrop: true,
    });
  }
  closeTermsPolicyDialog(): void {
    this.dialogRef.close();
  }
}
