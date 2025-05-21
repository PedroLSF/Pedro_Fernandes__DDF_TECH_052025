import { createId } from '@paralleldrive/cuid2';

export enum IdPrefixes {
  user = 'usr',
  essay = 'esa',
  planning = 'plg',
}

const maxPrefixLen = 7;

export const generateId = (prefix?: string): string => {
  const id = createId();
  if (!prefix) {
    return id;
  }
  const allowedPrefixes = new Set<string>(Object.values(IdPrefixes));
  if (!allowedPrefixes.has(prefix)) {
    throw new Error(`Invalid prefix: ${prefix}`);
  }
  return `${prefix.substring(0, maxPrefixLen)}_${id}`;
};
