import { _mock } from './_mock';

export const CATEGORY_STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo', dataCy: 'Active' },
  { value: 'false', label: 'Inativo', dataCy: 'Inactive' },
];
export const _categoryList = [...Array(20)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.categoryName(index),
  active: (index % 2 && true) || false,
  createdAt: _mock.time(index),
}));
