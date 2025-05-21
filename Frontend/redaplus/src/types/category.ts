import type { IContentItem } from './content';

export type ICategoryTableFilterValue = string | string[] | Date | null;

export type ICategoryTableFilters = {
  name: string | undefined;
  active: boolean | undefined | any;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  category_id?: string | undefined | any;
  only_entities: boolean | undefined | any;
};

export type ICategory = {
  id: string;
  name: string;
  active: boolean;
  is_primary: boolean;
  parent_id?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;

  _count?: _countVideos;

  videos?: IContentItem[];
  parent?: ICategory | null;
  children?: ICategory[] | null;
  path?: Array<{ id: string; name: string }>;
};

export type _countVideos = {
  videos: number;
  files: number;
  children: number;
};
