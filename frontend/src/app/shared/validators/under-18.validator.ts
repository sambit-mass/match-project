import { AbstractControl, ValidatorFn } from '@angular/forms';

export function UnderEighteenValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return { under18: true };
    }
    return null;
  };
}
