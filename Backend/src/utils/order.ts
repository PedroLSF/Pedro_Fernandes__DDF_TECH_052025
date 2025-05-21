export type InputOrderBy = {
  order: Record<string, 'desc' | 'asc'>;
};

export const orderBy = (input: InputOrderBy) =>
  Object.keys(input.order).reduce(
    (acc, key) => {
      if (key.includes('.')) {
        const [l, r] = key.split('.');
        return { ...acc, [l]: { [r]: input.order[key] } };
      }

      return { ...acc, [key]: input.order[key] };
    },
    {} as InputOrderBy['order'],
  );
