import { omit } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';

import Chip from '@mui/material/Chip';
import {
  AutocompleteOwnerState,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete/Autocomplete';

import { fetcher } from '../../utils/axios';
import { RHFAutocomplete } from '../hook-form';
import { useDebounce } from '../../hooks/use-debounce';
import useFirstRender from '../../hooks/use-first-render';

type Props<T> = {
  name: string;
  label: string;
  placeholder: string;
  value?: null | T;
  url: string;
  labelKey?: string;
  idKey?: string;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: any,
    state: AutocompleteRenderOptionState,
    ownerState: AutocompleteOwnerState<any, any, any, any, any>
  ) => React.ReactNode;
  renderTags?: (
    value: T[],
    getTagProps: AutocompleteRenderGetTagProps,
    ownerState: AutocompleteOwnerState<any, any, any, any, any>
  ) => React.ReactNode;
  getSearchPayload: (search: string) => object;
};

export default function SearchAutocomplete<T extends Record<string, any>>(props: Props<T>) {
  const { getSearchPayload, renderOption, renderTags, labelKey, idKey, value, url } = props;
  const [_search, setSearch] = useState('');
  const search = useDebounce(_search, 500);
  const [data, setData] = useState<T[]>([]);
  const isFirstRender = useFirstRender();

  useEffect(() => {
    (async () => {
      try {
        if (isFirstRender) {
          return;
        }

        const { results } = await fetcher([
          url,
          {
            params: {
              take: 20,
              skip: 0,
              filter: getSearchPayload(search),
              order: { name: 'asc' },
            },
          },
        ]);
        setData(results);
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message ?? error.message);
      }
    })();
  }, [getSearchPayload, url, isFirstRender, search]);

  return (
    <RHFAutocomplete
      {...omit(props, ['getSearchPayload'])}
      onTextChange={(event) => {
        setSearch(event.target.value);
      }}
      value={value}
      freeSolo
      options={data}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option[labelKey ?? 'name']
      }
      renderOption={
        renderOption ??
        ((p, option) => (
          <li {...p} key={option[idKey ?? 'id']}>
            {typeof option === 'string' ? option : option[labelKey ?? 'name']}
          </li>
        ))
      }
      renderTags={
        renderTags ??
        ((selected, getTagProps) =>
          selected.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={typeof option === 'string' ? option : option[idKey ?? 'name']}
              label={typeof option === 'string' ? option : option[labelKey ?? 'name']}
              size="small"
              variant="soft"
            />
          )))
      }
    />
  );
}
