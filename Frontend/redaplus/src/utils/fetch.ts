import qs from 'qs';
import { serialize } from 'object-to-formdata';

export function queryString(params = {}, options = {}) {
  return qs.stringify(parseParams(params), { arrayFormat: 'brackets', ...options });
}

export function formData(data = {}, options = {}) {
  return serialize(parseParams(data), { indices: true, ...options });
}

export function parseParams(data = {}) {
  const result = {};

  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const attr in data) {
    // @ts-ignore
    let value = data[attr];

    // Ignore undefined
    if (typeof value === 'undefined') {
      // eslint-disable-next-line no-continue
      continue;
    }

    // Transform bool to intbool
    if (typeof value === 'boolean') {
      value = Number(value);
    }

    // Transform null to empty string
    if (value === null) {
      value = '';
    }

    // Recursive for array or object
    if (value instanceof Array || value instanceof Object) {
      if (!(value instanceof FileList) && !(value instanceof File)) {
        value = parseParams(value);
      }
    }

    // @ts-ignore
    result[attr] = value;
  }

  return result;
}

export function getError(err: any) {
  if (typeof err === 'string') {
    return err;
  }

  return err?.response?.data?.message || err?.data?.message || err?.message;
}
