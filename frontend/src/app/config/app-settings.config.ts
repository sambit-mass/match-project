export const appSettings = {
  appTitle: 'Angular Project',
  credentialsKey: 'match_by_AI_user',
  rememberKey: 'match_by_AI_remember',
  default_language: 'default_language',
  rowsPerPage: 10,
  ajaxTimeout: 300000,
  mobilePattern: /^[\d()+-]+$/,
  number: /^\d+$/,
  whitespacePattern: /^(?! *$)[\s\S]+$/,
  emailPattern:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/,
  stringFilterDropdown: [
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
  ],
  dateFilterDropdown: [
    { value: 'dateIs', label: 'Date is' },
    { value: 'dateIsNot', label: 'Date is not' },
    { value: 'dateIsBefore', label: 'Date is before' },
    { value: 'dateIsAfter', label: 'Date is after' },
  ],
  customDateFormate: {
    parse: {
      dateInput: 'MM/DD/YYYY',
    },
    display: {
      dateInput: 'MM/DD/YYYY',
      monthYearLabel: 'MM/DD/YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MM/DD/YYYY',
    },
  },
  ai_urls: ['aboutme/create_aboutme'],
};
