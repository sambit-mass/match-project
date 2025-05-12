import { Injectable } from '@angular/core';
import { MatDateFormats, NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${this._to2digit(month)}/${this._to2digit(day)}/${year}`;
    } else if (displayFormat === 'monthYearLabel') {
      // Format for the month-year header (MAY 2007)
      const month = date.toLocaleString(this.locale, { month: 'short' }).toUpperCase();
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
    return super.format(date, displayFormat);
  }

  private _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }
}

export const MY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input', // This controls the input display format (01/01/1888)
    monthYearLabel: 'monthYearLabel', // This controls the calendar header (MAY 2007)
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};
