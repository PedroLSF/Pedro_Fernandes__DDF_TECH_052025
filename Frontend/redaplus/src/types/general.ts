import { compareValues } from 'src/utils/sort';

import { IFile } from './file-manager';

export const currentEntityIdStorageKey = '@@Redaplus/currentEntity';
export const currentEntityIdNullKey = 'null';

export const orderFieldSelected = (field: keyof typeof fields, sorted: string) => {
  const fields = {
    title: (a: IFile, b: IFile) => compareValues(a.name, b.name, sorted),
    updated_at: (a: IFile, b: IFile) => compareValues(a.createdAt, b.createdAt, sorted),
  };

  return fields[field];
};
