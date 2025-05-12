interface IDeepLinkingDetails {
  user_type: string;
  route_value: string;
  need_to_login: number;
  route_description?: string;
  route_identification: string | number;
  route_details: { [key: string]: any };
}

interface IDropdownOption {
  id?: number | string;
  value?: number | string;
  label?: number | string;
}

interface IMatTableFilter {
  globalFilterColumns: string[];
  filterObject: IMatTableFilterObject;
}

interface IMatTableFilterObject extends Record<string, IFilter> {
  globalFilter: IFilter;
}

interface IFilter {
  filter: {
    value: number | string;
    matchMode?: IStringMatchMode | IDateMatchMode;
  };
}

type IStringMatchMode =
  | 'startsWith'
  | 'endsWith'
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals';

type IDateMatchMode = 'dateIs' | 'dateIsNot' | 'dateIsBefore' | 'dateIsAfter';

interface IBespokeInfo {
  id: number;
  image: string;
  information: string;
}

type IPageType = 'add' | 'edit';

interface IMainMenu {
  value: boolean;
  action: Action[];
  main_menu_id: number;
  sub_menu: SubMenu[];
  main_menu: string;
}

interface SubMenu {
  value: boolean;
  action: Action[];
  sub_menu_id: number;
  name: string;
}

interface Action {
  name: string;
  value: boolean;
  action_id: number;
}

interface ILanguageSelection {
  id: number;
  value: string;
  name: Name;
}

interface Name {
  en: string;
  zh: string;
}
