import React, { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

import { IVideoFilters, IVideoFilterValue } from 'src/types/video';

// ----------------------------------------------------------------------

type Props = {
  filters: IVideoFilters;
  onFilters: (title: string, value: IVideoFilterValue) => void;
};

export default function VideoSearch({ filters, onFilters }: Props) {
  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('title', event.target.value);
    },
    [onFilters]
  );

  return (
    <Stack
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        mt: 2.5,
        ml: 3,
        width: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          data-cy="type-search-video"
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Pesquisar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled' }}
                  data-cy="button-search-video"
                />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}
