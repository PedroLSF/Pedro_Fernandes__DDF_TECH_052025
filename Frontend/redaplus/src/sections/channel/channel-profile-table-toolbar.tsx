import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

import { IVideoFilters } from 'src/types/video';

// ----------------------------------------------------------------------

type Props = {
  filters: IVideoFilters;
  onFilters?: (name: string, value: string) => void;
  applyFilters: VoidFunction;
};

export default function ChannelProfileTableToolbar({ filters, onFilters, applyFilters }: Props) {
  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        py: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          data-cy="type-search-channel"
          fullWidth
          name="title"
          value={filters.name}
          onChange={(event) => {
            onFilters?.(event.target.name, event.target.value);
          }}
          placeholder="Pesquisar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled' }}
                  data-cy="button-search-chanel-profile"
                />
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          // not remove this arrow wrapper
          onClick={() => applyFilters()}
          data-cy="video-channel-search"
        >
          <Iconify icon="mdi:tab-search" width={34} />
        </IconButton>
      </Stack>
    </Stack>
  );
}
