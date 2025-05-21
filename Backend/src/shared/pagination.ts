export const DEFAULT_PAGE_SIZE = 9;

export type Paginated<T> = {
  results: T[];
  total: number;
  take: number;
  skip: number;
  currentPage?: number;
};

export function paginate<T>(options: Paginated<T>): Paginated<T> {
  const totalPages = Math.ceil(options.total / options.take);
  const currentPage =
    options.currentPage ?? Math.floor(options.skip / options.take) + 1;
  return {
    results: options.results,
    total: options.total,
    take: options.take,
    skip: options.skip,
    totalPages,
    currentPage,
  } as Paginated<T>;
}

export function serializePagination<T>(
  serializer: any,
  paginated: Paginated<T>,
): Paginated<T> {
  return {
    ...paginated,
    results: paginated.results.map((result) => new serializer(result)),
  };
}
