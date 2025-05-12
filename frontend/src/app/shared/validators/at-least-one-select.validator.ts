import { ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';

/** custom validator for at least one checkbox select */
export function atLeastOneSelectedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    // Check if at least one checkbox is selected (true)
    const isSelected = formArray.controls.some(control => control.value === true);
    // Return an error object if not selected, otherwise return null
    return isSelected ? null : { atLeastOneSelected: true };
  };
}
