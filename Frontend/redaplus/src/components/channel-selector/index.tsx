import { useSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Box, Divider, ListItemText } from '@mui/material';
import Dialog, { dialogClasses } from '@mui/material/Dialog';

import { IChannel } from 'src/types/channel';
import { IPaginated, defaultPaginated } from 'src/types/pagination';

import Label from '../label';
import Iconify from '../iconify';
import Scrollbar from '../scrollbar/scrollbar';
import SearchNotFound from '../search-not-found';
import { useBoolean } from '../../hooks/use-boolean';
import { fetcher, endpoints } from '../../utils/axios';

type Props = {
  label: string;
  value?: IChannel[] | null;
  onChange?: (value: IChannel[] | null) => void;
  multiple?: boolean;
};

export default function ChannelSelector({ label, value, onChange, multiple = false }: Props) {
  const theme = useTheme();
  const search = useBoolean();

  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState<IChannel[]>(value ?? []);
  const [data, setData] = useState<IPaginated<IChannel>>(defaultPaginated);

  useEffect(() => {
    if (value) {
      const selectedValues = Array.isArray(value) ? value : [value];
      setSelected(selectedValues);

      if (selectedValues[0]?.name) {
        setShowLabel(selectedValues[0].name);
      } else {
        setShowLabel('');
      }
    }
  }, [value]);

  const fetchChannel = async (filters: Record<string, any> = {}) => {
    try {
      const channels = await fetcher([
        endpoints.channel.list,
        {
          params: {
            take: 50,
            skip: 0,
            filter: filters,
          },
        },
      ]);
      setData(channels);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao carregar canais', { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  const [showLabel, setShowLabel] = useState('Canal selecionado...');

  useEffect(() => {
    const searchTerm = searchQuery.toLowerCase();
    fetchChannel({ name: searchTerm }).then(null);
    // eslint-disable-next-line
  }, [searchQuery]);

  const clear = () => {
    const _value: IChannel[] = [];
    setSelected(_value);
    onChange?.(_value);
    setShowLabel('Canal selecionado...');
  };

  const handleItemClick = (channel: IChannel) => {
    let updatedSelected;
    if (multiple) {
      if (selected.some((selectedChannel) => selectedChannel.id === channel.id)) {
        updatedSelected = selected.filter((selectedChannel) => selectedChannel.id !== channel.id);
      } else {
        updatedSelected = [...selected, channel];
      }
    } else {
      updatedSelected = [channel];
      handleClose();
    }

    setSelected(updatedSelected);
    onChange?.(updatedSelected);

    const labelSelected =
      updatedSelected.length > 0
        ? updatedSelected.map((ch) => ch.name).join(', ')
        : 'Canal selecionado...';
    setShowLabel(labelSelected);
  };

  const renderButton = (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button
        size="large"
        variant="outlined"
        onClick={search.onTrue}
        data-cy="category-selector-button"
        disabled={!!value}
      >
        {label}
      </Button>
      <Box
        sx={{
          width: { md: '70%' },
          ml: 2.5,
        }}
      >
        <TextField
          name="category-selection-value"
          data-cy="category-selection-value"
          fullWidth
          type="text"
          value={showLabel}
          sx={{
            color: theme.palette.grey[400],
            cursor: 'not-allowed',
          }}
        />
      </Box>
      {selected.length > 0 && (
        <IconButton
          color="error"
          size="large"
          onClick={() => clear()}
          data-cy="category-clear-button"
          disabled={!!value}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      )}
    </Stack>
  );

  const renderDialog = (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={search.value}
      onClose={handleClose}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: 0,
      }}
      PaperProps={{
        sx: {
          mt: 15,
          overflow: 'unset',
        },
      }}
      sx={{
        [`& .${dialogClasses.container}`]: {
          alignItems: 'flex-start',
        },
      }}
      data-cy="category-selector-dialog"
    >
      <Box
        sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}
        data-cy="category-selector-search"
      >
        <InputBase
          fullWidth
          autoFocus
          placeholder="Pesquisar..."
          value={searchQuery}
          onChange={handleSearch}
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
          inputProps={{
            sx: { typography: 'h6' },
          }}
        />
      </Box>

      <Box sx={{ height: 400 }}>
        <Scrollbar sx={{ p: 3, pt: 2, height: 380 }}>
          {data.total === 0 && data.results.length === 0 ? (
            <SearchNotFound query={searchQuery} sx={{ py: 10 }} />
          ) : (
            data.results.map((channelItem) => (
              <ChannelItem
                key={channelItem.id}
                channelItem={channelItem}
                onClick={handleItemClick}
                selected={selected.some((selectedChannel) => selectedChannel.id === channelItem.id)}
              />
            ))
          )}
        </Scrollbar>
      </Box>

      <Divider />

      <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{ my: 2, width: 65 }}
          data-cy="category-selector-tree-button"
        >
          OK
        </Button>
      </Stack>
    </Dialog>
  );

  return (
    <div
      data-cy="category-selector"
      style={{
        pointerEvents: value ? 'none' : 'auto',
      }}
    >
      {renderButton}
      {renderDialog}
    </div>
  );
}

// ----------------------------------------------------------------------

type ChannelItemProps = {
  channelItem: IChannel;
  onClick: (channel: IChannel) => void;
  selected: boolean;
};

function ChannelItem({ channelItem, onClick, selected }: ChannelItemProps) {
  const { name } = channelItem;

  return (
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
      sx={{
        py: 0.5,
        px: 2,
        maxWidth: '100%',
        cursor: 'pointer',
        borderRadius: 1,
        transition: 'background-color 0.3s',
        backgroundColor: selected ? 'rgba(0, 123, 255, 0.08)' : 'transparent',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.action.hover,
          borderRadius: 1,
        },
        minHeight: '40px',
      }}
      onClick={() => onClick(channelItem)}
    >
      <Iconify icon="grommet-icons:channel" width={15} color="gray" />

      <ListItemText
        primary={name}
        primaryTypographyProps={{
          noWrap: true,
          typography: 'subtitle2',
        }}
        secondaryTypographyProps={{
          mt: 0.5,
          noWrap: true,
          component: 'span',
        }}
      />
    </Stack>
  );
}
