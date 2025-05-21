export type IPaginated<T> = {
  results: T[];
  take: number;
  skip: number;
  totalPages: number;
  total: number;
  currentPage: number;
  metadata?: Record<string, any>;
};

export const defaultPaginated: IPaginated<any> = {
  results: [],
  take: 0,
  skip: 0,
  totalPages: 0,
  total: 0,
  currentPage: 0,
};
