export type IProject = {
  id: string;
  name: string;
  active: boolean;
  created_at?: Date;
  updated_at?: Date | null;
};

export type IProjectItem = {
  id: string;
  name: string;
  active: boolean;
  created_at?: Date;
};

export type IProjectTableFilters = {
  name: string;
  active: boolean | string;
};

export type IProjectTableFilterValue = string | string[];

export const PROJECT_STATUS_OPTIONS = [
  { value: true, label: 'Ativo' },
  { value: false, label: 'Inativo' },
];

export type IProjectTableFilterValues = {};
