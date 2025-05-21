import { isValid } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

import { usePathname } from '../routes/hooks';
import { isIsoDate } from '../utils/format-time';

const parseFilters = <T extends Record<string, any>>(
  filters: T,
  castBoolToInt?: boolean,
  trimStrings?: boolean,
  removeEmptyStrings?: boolean
) =>
  Object.keys(filters).reduce((acc, key) => {
    let value = filters[key];

    if (removeEmptyStrings && value === '') {
      return acc;
    }

    if (trimStrings && typeof (value as any) === 'string') {
      value = value.trim();
    }

    if (castBoolToInt && (value === 'true' || value === true)) {
      value = 1;
    }

    if (castBoolToInt && (value === 'false' || value === false)) {
      value = 0;
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {} as T);

export type useFilterProps<T> = {
  initialFilters: T;
  handler: (filters: T) => Promise<void>;
  persist?: boolean;
  castBoolToInt?: boolean;
  trimStrings?: boolean;
  removeEmptyStrings?: boolean;
};

export function useFilter<T extends Record<string, any>>({
  initialFilters,
  handler,
  persist = false,
  castBoolToInt = true,
  trimStrings = true,
  removeEmptyStrings = true,
}: useFilterProps<T>) {
  const pathname = usePathname();

  const [untouchedInitialFilters] = useState(initialFilters);
  const [persisted, setPersisted] = useState(false);

  const getPersistedParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const persistedFilters: any = {};
    const parseValue = (value: any) => {
      if (value === 'true' || value === '1') {
        return true;
      }
      if (value === 'false' || value === '0') {
        return false;
      }
      if (isIsoDate(value)) {
        const date = Date.parse(value);
        return new Date(date);
      }
      return value;
    };
    urlParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        persistedFilters[key.replace('filter_', '')] = parseValue(value);
      }
    });
    return persistedFilters;
  }, []);

  const getInitialFilters = useCallback(() => {
    if (!persist) {
      return initialFilters;
    }
    const p = getPersistedParams();
    return {
      ...initialFilters,
      ...p,
    };
    // eslint-disable-next-line
  }, []);

  const [filters, setFilters] = useState<T>(getInitialFilters());

  const handleFilterChange = useCallback((name: any, value: any) => {
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      [name]: value,
    }));
  }, []);

  const handlePersistFilter = useCallback(
    (_filters: Record<string, any>) => {
      const urlParams = new URLSearchParams(window.location.search);
      const serializeValue = (value: any) => {
        if (typeof value === 'boolean') {
          return value ? '1' : '0';
        }
        if (value instanceof Date) {
          return isValid(value) ? value.toISOString() : undefined;
        }
        return value;
      };
      Object.keys(_filters).forEach((key) => {
        if (_filters[key] === initialFilters[key]) {
          urlParams.delete(`filter_${key}`);
        } else {
          const serialized = serializeValue(_filters[key]);
          if (typeof serialized === 'undefined') {
            urlParams.delete(`filter_${key}`);
          }
          // Uncomment to enable feature
          // urlParams.set(`filter_${key}`, serialized);
        }
      });
      window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    },
    [initialFilters]
  );

  const applyFilters = useCallback(
    (instantFilter?: Record<string, any>) => {
      const toApplyFilters = {
        ...filters,
        ...(instantFilter || {}),
      };
      if (persist) {
        handlePersistFilter(toApplyFilters);
      }
      handler(parseFilters(toApplyFilters, castBoolToInt, trimStrings, removeEmptyStrings)).then(
        null
      );
    },
    [castBoolToInt, filters, handlePersistFilter, handler, persist, removeEmptyStrings, trimStrings]
  );

  const resetFilters = useCallback(() => {
    setFilters(untouchedInitialFilters);
    applyFilters();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (persist) {
      setPersisted(true);
    }
    // eslint-disable-next-line
  }, []);

  const clearPersistedFilters = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const markToDelete: string[] = [];
    urlParams.forEach((_, key) => {
      if (key.startsWith('filter_')) {
        markToDelete.push(key);
      }
    });
    if (markToDelete.length) {
      markToDelete.forEach((key) => urlParams.delete(key));
      setTimeout(() => {
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (persisted) {
      clearPersistedFilters();
    }
  }, [clearPersistedFilters, pathname, persisted]);

  return {
    filters,
    handleFilterChange,
    applyFilters,
    resetFilters,
    persisted,
  };
}
