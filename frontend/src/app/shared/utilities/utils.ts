import Bowser from 'bowser';

interface IBrowserInfo {
  session_id: string;
  browser_id: string;
  browser_name: string;
  browser_version: string;
}

interface IValidationError {
  _fileName: string;
  _fileSize: number;
  _isMatchedExt: boolean;
  _isSizeExceeds: boolean;
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DD/MM/YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD/MM/YYYY',
  },
};

/**
 * *Checking if a string or number is a valid number
 * @param n
 * @returns boolean
 */
export function isNumber(n: string | number): boolean {
  return !isNaN(parseFloat(n.toString())) && isFinite(Number(n));
}

/**
 * *Checking if a arg is object
 *
 * @param arg - object | array
 * @returns object | boolean
 */
export function isObject(arg: any) {
  return typeof arg === 'object' && arg !== null && !(arg instanceof Array) ? arg : false;
}

/**
 * *Generating random string
 *
 * @param length : length of the string to return
 */
export function generateRandomString(length: number) {
  let randomString = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}

/**
 * *Formatting bytes to human reliable units
 *
 * @param fileSize : A javascript number contains file size in bytes
 */
export function formatSizeUnits(fileSize: number) {
  if (fileSize > 0) {
    const bytes: number = fileSize;
    const decimals = 2;

    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  } else {
    return null;
  }
}

/**
 * *Formatting timestamp to desired format
 *
 * @param timestamp
 * @param returnType
 * @returns number | hour | minute | second
 */
export function formattedTime(timestamp: number, returnType: 'hour' | 'minute' | 'second'): number {
  const unix_timestamp = timestamp;
  const date = new Date(unix_timestamp * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  let toReturn!: number;

  switch (returnType) {
    case 'hour':
      toReturn = hours;
      break;
    case 'minute':
      toReturn = minutes;
      break;
    case 'second':
      toReturn = seconds;
      break;
    default:
      break;
  }

  return toReturn;
}

/**
 * *Filter to abbreviate a number
 *
 * @param value : A javascript number as parameter
 */
export function toAbbreviateNumber(value: number) {
  let shortValue = 0;
  let newValue = value;
  if (value >= 1000) {
    const suffixes = ['', 'k', 'm', 'b', 't'];
    const suffixNum = Math.floor(('' + value).length / 3);
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision)
      );
      const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
      if (dotLessShortValue.length <= 2) {
        break;
      }
    }
    if (shortValue % 1 !== 0) {
      shortValue = +shortValue.toFixed(1);
    }
    newValue = Number(shortValue + suffixes[suffixNum]);
  }
  return newValue;
}

/**
 * *Defining time for greeting
 *
 * @returns string
 */
export function timeGreeting(): string {
  let greeting = '';
  const data = [
    [0, 4, 'Good morning'],
    [5, 11, 'Good morning'],
    [12, 16, 'Good afternoon'],
    [17, 18, 'Good evening'],
    [19, 24, 'Good night'],
  ];
  const hour = new Date().getHours();

  for (let i = 0; i < data.length; i++) {
    if (hour >= Number(data[i][0]) && hour <= Number(data[i][1])) {
      const result = data[i][2].toString();
      greeting = result
        .split(' ')
        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
      break;
    }
  }

  return greeting;
}

/**
 * *Uploaded file size and extension validation
 *
 * @param event javascript file change event
 */
export function fileUploadValidation(
  event: Event,
  fileSize: number,
  fileSizeType: 'kb' | 'mb',
  fileTypes: string[]
): IValidationError | null {
  fileSize = fileSize || 1;
  let validationInfo: IValidationError;
  const files = (event.target as HTMLInputElement).files as FileList;

  if (files.length > 0) {
    // Getting list of files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const _fileName = file.name; // file name
      const _fileSize = file.size; // file size
      const _fileTypes = fileTypes; // preferred extensions
      const _sizeInMB = file.size / (1024 * 1024);
      const _sizeInKB = file.size / 1024;

      const _fileExtension = _fileName.split('.')[_fileName.split('.').length - 1].toLowerCase(); // file extension

      const _isMatchedExt: boolean = _fileTypes.indexOf(_fileExtension) > -1;
      const _isSizeExceeds: boolean =
        fileSizeType === 'mb' ? _sizeInMB > fileSize : _sizeInKB > fileSize;

      // OR together the accepted extensions and NOT it. Then OR the size cond.
      if (!_isMatchedExt || _isSizeExceeds) {
        /**
         * !avoid this due to Object Literal Shorthand Syntax
         * ! _fileName: _fileName to _fileName
         * !_fileSize: _fileSize to _fileSize
         * *This rule enforces the use of the shorthand syntax
         */
        validationInfo = {
          _fileName,
          _fileSize,
          _isMatchedExt,
          _isSizeExceeds,
        };
        return validationInfo;
      } else {
        return null;
      }
    }
    return null;
  } else {
    return null;
  }
}

/**
 * *Converting image to base 64 from file
 *
 * @param file File
 * @returns base64 string
 */
export function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * *Converting base 64 to file
 *
 * @param base64 string
 * @param file_name string
 * @returns file File
 */
export function dataURLtoFile(data_url: string, file_name: string) {
  var arr = data_url.split(','),
    mime = arr[0].match(/:(.*?);/)![1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], file_name, { type: mime });
}

/**
 * *Function to check if a email is valid
 *
 * @param email
 * @returns boolean
 */
export function validateEmail(email: string): boolean {
  const rgx =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/;
  return rgx.test(String(email).toLowerCase());
}

/**
 * *Function to download file from url
 *
 * @param filename
 * @param dataUrl
 */
export function downloadDataUrl(dataUrl: string, filename?: string, target?: string) {
  // Construct the 'a' element
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = dataUrl;
  if (target) link.target = target;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  // Cleanup the DOM
  document.body.removeChild(link);
}

/**
 * *Getting x and y postion of an element
 * @param el
 * @returns x and y postion
 */
export function getOffset(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

/**
 * *Remove property form an array of object
 * @param obj any array of object
 * @param propsToRemove property name array
 */
export function removeProperties(obj: any, propsToRemove: string[]) {
  if (Array.isArray(obj)) {
    obj.forEach(item => removeProperties(item, propsToRemove));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (propsToRemove.includes(key)) {
        delete obj[key];
      } else {
        removeProperties(obj[key], propsToRemove);
      }
    }
  }
}

/**
 * Remove queryParam and fragment from url
 * @param url
 * @returns string
 */
export function getPathFromUrl(url: string) {
  return url.split(/[?#]/)[0];
}

/**
 * *Generate random browser id, session id and get browser info using Bowser package
 *
 * @returns browser id,session id,browser name,browser version
 * @developer Abhisek Dhua
 */
export function browserInfo(): IBrowserInfo {
  const browserInfo = Bowser.getParser(window.navigator.userAgent).getResult();
  let sessionId = generateRandomString(32);
  const browserName = browserInfo.browser.name;
  const browserVersion = browserInfo.browser.version;
  const currentBrowserId = localStorage.getItem('browser-id');
  const currentSessionId = sessionStorage.getItem('session-id');
  let browserId = `${generateRandomString(32)}-${browserName}-${browserVersion}`;
  // re-generate browser_id if required
  if (!currentBrowserId) {
    localStorage.setItem('browser-id', browserId);
  } else {
    browserId = currentBrowserId;
  }
  // re-generate session_id if required
  if (!currentSessionId) {
    sessionStorage.setItem('session-id', sessionId);
  } else {
    sessionId = currentSessionId;
  }
  return {
    browser_id: browserId,
    session_id: sessionId,
    browser_name: browserName,
    browser_version: browserVersion,
  } as IBrowserInfo;
}

/* ########################################## Client side mat-filter setup start ########################################## */

/**
 * Predicate function for Mat table filter
 * @returns predicate function
 */
export function customFilterPredicate() {
  const customFilterFn = function (data: any /* Type of form data */, filter: string): boolean {
    let isGlobalFilterMatchFound = true;
    const isIndividualFilterMatchFound: boolean[] = [];
    const matTableFilter: IMatTableFilter = JSON.parse(filter);
    const filteredValues = matTableFilter.filterObject; // either object or data
    for (const key in filteredValues) {
      // individual filter functionality
      if (Object.prototype.hasOwnProperty.call(filteredValues, key) && key !== 'globalFilter') {
        const element = filteredValues[key];
        if (element.filter.value !== '') {
          isIndividualFilterMatchFound.push(
            filterWithMatchMode(
              data[key as keyof typeof data].toString(),
              element.filter.value.toString(),
              element.filter.matchMode ?? 'contains'
            )
          );
        }
      }
      // global filter functionality
      if (Object.prototype.hasOwnProperty.call(filteredValues, key) && key === 'globalFilter') {
        const element = filteredValues[key];
        if (element.filter.value !== '') {
          isGlobalFilterMatchFound = Object.entries(data).some(([key, val]) => {
            if (matTableFilter.globalFilterColumns.includes(key)) {
              return (val as string | number)
                .toString()
                .trim()
                .toLowerCase()
                .includes(element.filter.value.toString().trim().toLowerCase());
            } else {
              return false;
            }
          });
        }
      }
    }
    return isIndividualFilterMatchFound.every(found => found) && isGlobalFilterMatchFound;
  };
  return customFilterFn;
}

/**
 * Filter functionality for MatchModes
 * @param value
 * @param filter
 * @param matchMode
 * @returns boolean
 */
export function filterWithMatchMode(value: string, filter: string, matchMode: string) {
  if (matchMode === 'startsWith') {
    return value.toString().trim().toLowerCase().startsWith(filter.toString().trim().toLowerCase());
  }
  if (matchMode === 'endsWith') {
    return value.toString().trim().toLowerCase().endsWith(filter.toString().trim().toLowerCase());
  }
  if (matchMode === 'contains') {
    return value.toString().trim().toLowerCase().includes(filter.toString().trim().toLowerCase());
  }
  if (matchMode === 'notContains') {
    return !value.toString().trim().toLowerCase().includes(filter.toString().trim().toLowerCase());
  }
  if (matchMode === 'equals') {
    return value.toString().trim().toLowerCase() === filter.toString().trim().toLowerCase();
  }
  if (matchMode === 'notEquals') {
    return value.toString().trim().toLowerCase() !== filter.toString().trim().toLowerCase();
  }
  if (matchMode === 'noFilter') {
    return true;
  }
  return true;
}

/* ########################################### Client side mat-filter setup end ########################################### */
