import { ICategory } from './category';

export interface SchemaFilters {
  name: string;
  label?: string;
  type: 'date' | 'text' | 'category' | 'checkbox' | 'channel' | 'ID';
  dataCy?: string;
  placeholder?: string;
  handle?: any;
  options?: any;
  multiple?: boolean;
  select_double_click?: boolean;
}

export interface SchemaFiltersResults {
  name: string;
  type: 'date' | 'text' | 'category' | 'enum' | 'boolean' | 'checkbox' | 'channel' | 'ID';
  enum?: AnyObject;
  label?: string;
  parentLabel: string;
  dataCy?: string;
  category?: ICategory;
}
