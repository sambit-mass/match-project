interface IListInfo {
  first: number; // default 0
  sortField: string; // default ''
  sortOrder: number | string; // 0 => nothing, 1 => asc, -1 => desc
  filters: Record<
    string,
    {
      value: string | number;
    }
  >;
  globalFilter: string | number;
  otherObj?: Record<string, any>;
}

interface IFileObj {
  file: File;
  icon?: string;
  progress?: number;
  file_url?: string;
  file_name: string;
  extension?: string;
}
