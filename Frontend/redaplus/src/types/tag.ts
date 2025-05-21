export type ITagItem = {
  id: string;
  name: string;
  color: string;
  active: boolean;
  created_at?: Date;
};

export type ITag = {
  results: ITagItem[];
  total: number;
  take: number;
  skip: number;
  totalPages: number;
  currentPage: number;
};

export type ITagTableFilters = {
  name: string;
  color: string;
  active: boolean | string;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  category_id?: string | undefined | any;
};

export type ITagTableFilterValue = string | string[] | Date | null;

export const TAG_STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo', dataCy: 'ativo-status' },
  { value: 'false', label: 'Inativo', dataCy: 'inativo-status' },
];

export const TAG_COLOR_NAME_OPTIONS = [
  { value: '#fbacac', label: 'Vermelha', dataCy: 'vermelho-color' },
  { value: '#c6d5fb', label: 'Azul', dataCy: 'azul-color' },
  { value: '#d4fbd4', label: 'Verde', dataCy: 'verde-color' },
  { value: '#fafbac', label: 'Amarela', dataCy: 'amarelo-color' },
  { value: '#f3acfb', label: 'Violeta', dataCy: 'violeta-color' },
  { value: '#8e8e8e', label: 'Cinza', dataCy: 'cinza-color' },
  { value: '#fdfdfd', label: 'Branco', dataCy: 'branco-color' },
];
