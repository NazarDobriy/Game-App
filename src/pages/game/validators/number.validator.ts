import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const INTEGER_REGEX = /^\d+$/;

export const integerValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === '') {
      return null;
    }

    if (!INTEGER_REGEX.test(value)) {
      return { integer: true };
    }

    return null;
  };
};
