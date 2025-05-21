import { AnyObject, XOR } from '@domain/types/types';

export type InputMakeOrFilter = {
  definition: Array<{
    field?: string;
    operator?: string;
    value?: string | boolean | AnyObject | string[];
  }>;
  resource: AnyObject;
  operator?: 'AND' | 'OR';
};
export type OutputMakeOrFilter =
  | XOR<{ OR: AnyObject[] }, { AND: AnyObject[] }>
  | Record<string, never>;

export const makeFilter = (input: InputMakeOrFilter): OutputMakeOrFilter => {
  if (typeof input.resource === 'undefined') {
    return {};
  }

  const operator = input?.operator ?? 'OR';

  const operations = [];

  for (const item of input.definition) {
    const getValue = () =>
      'value' in item ? item.value : input.resource[item.field];

    const value = getValue();
    if (typeof value === 'undefined') {
      continue;
    }

    if (!('field' in item) && 'value' in item) {
      operations.push(value);
      continue;
    }

    operations.push({
      [item.field]: item.operator
        ? {
            [item.operator]: value,
          }
        : value,
    });
  }
  return operations.length
    ? ({ [operator]: operations } as Record<'OR' | 'AND', never>)
    : {};
};

export const makeFindByManyConditionals = (
  and: Array<{ type: string; value: any }>,
) =>
  and.map(({ type, value }) => {
    if (type.includes('.')) {
      const [prop, ...paths] = type.split('.');
      return {
        [prop]: {
          path: `$.${paths.join('.')}`,
          equals: value,
        },
      };
    }
    return {
      [type]: value,
    };
  });
