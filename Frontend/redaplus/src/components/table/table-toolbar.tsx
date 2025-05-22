import { isAfter } from 'date-fns';
import React, { useRef, Dispatch, useState, useEffect, useCallback, SetStateAction } from 'react';

import Box from '@mui/system/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { DatePicker } from '@mui/x-date-pickers';
import { Card, Stack, TextField, Typography, InputAdornment } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { getCategoryId } from 'src/utils/getCategoryId';

import Iconify from 'src/components/iconify';

import { SchemaFilters } from 'src/types/generic';

// ----------------------------------------------------------------------

type Props = {
  filters: AnyObject;
  schema: Array<SchemaFilters>;
  onFilters: (name: string, value: any) => void;
  setShowFiltersResults: Dispatch<SetStateAction<boolean>>;
  applyFilters: (instantFilter?: Record<string, any>) => void;
  falseShowFiltersResults?: Boolean;
  filter_in_channel?: Boolean;
  channel_id?: string;
  loading?: boolean;
};

export default function TableToolbar({
  filters,
  setShowFiltersResults,
  schema,
  onFilters,
  applyFilters,
  falseShowFiltersResults = true,
  filter_in_channel = false,
  channel_id,
  loading = false,
}: Props) {
  const urlParams = useSearchParams();

  const [textFilter, setTextFilter] = useState<string>('');
  const [idFilter, setIDFilter] = useState<string>('');

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // States
  const handleFilterChange = (name: string, value: any) => {
    onFilters(name, value);
  };

  const handleSearchButtonClick = useCallback(() => {
    applyFilters();
    setShowFiltersResults(true);
  }, [applyFilters, setShowFiltersResults]);

  useEffect(() => {
    if (falseShowFiltersResults) {
      setShowFiltersResults(false);
    }
  }, [setShowFiltersResults, filters, falseShowFiltersResults]);

  // Handlers
  const defaultTextHandler = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('@@@', name, event.target);
    const { value } = event.target;
    if (name === 'name' || name === 'title') {
      setTextFilter(value);
    } else {
      setIDFilter(value);
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      handleFilterChange(name, value);
    }, 200);
  };

  const defaultDateHandler = (name: string) => (value: any) => {
    handleFilterChange(name, value);
  };

  const defaultChannelHandler = (name: string) => (value: any) => {
    handleFilterChange(name, value);
  };

  const defaultCategoryHandler = (name: string) => (value: any) => {
    handleFilterChange(name, getCategoryId(value));
  };

  const defaultCheckboxHandler = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange(name, event.target.checked);
  };

  // Date Checker
  const dateErrorEndDate =
    Boolean(filters.start_date && filters.end_date) &&
    isAfter(filters.start_date as Date, filters.end_date as Date);

  return (
    <Card
      sx={{
        pt: 3.5,
        pb: 3.5,
        pr: 2.5,
        pl: 2.5,
        mb: 2.5,
        mt: 2.5,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Filtros
      </Typography>

      <Stack spacing={2} direction={{ xs: 'row', sm: 'row' }} sx={{ mt: 2, mb: 2 }}>
        {schema
          ?.filter((sc) => sc.type === 'date' || sc.type === 'text' || sc.type === 'ID')
          .map((sc) => {
            if (sc.type === 'date') {
              return (
                <Box key={`${sc.name}${sc.type}`} data-cy={sc.dataCy}>
                  <DatePicker
                    label={sc.label}
                    name={sc.name}
                    value={filters[sc.name]}
                    onChange={sc.handle ?? defaultDateHandler(sc.name)}
                    slotProps={{
                      textField: {
                        error: dateErrorEndDate,
                        helperText:
                          dateErrorEndDate && 'A data final deve ser maior que a data inicial.',
                      },
                    }}
                  />
                </Box>
              );
            }

            if (sc.type === 'ID') {
              return (
                <TextField
                  key={`${sc.name}${sc.type}`}
                  data-cy={sc.dataCy}
                  fullWidth
                  value={idFilter}
                  onChange={defaultTextHandler(sc.name)}
                  placeholder={sc.placeholder ?? 'Digitar...'}
                  sx={{
                    width: 450,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              );
            }

            if (sc.type === 'text') {
              return (
                <TextField
                  key={`${sc.name}${sc.type}`}
                  data-cy={sc.dataCy}
                  fullWidth
                  value={textFilter}
                  onChange={defaultTextHandler(sc.name)}
                  placeholder={sc.placeholder ?? 'Digitar...'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              );
            }

            return null;
          })}
      </Stack>

      <Stack spacing={2} direction={{ xs: 'row', sm: 'row' }} sx={{ mt: 2, mb: 2 }}>
        {schema
          ?.filter((sc) => sc.type === 'checkbox')
          .map((sc) => (
            <Stack key={`${sc.name}${sc.type}`} direction={{ xs: 'row', sm: 'row' }}>
              <Checkbox
                checked={filters[sc.name] ?? false}
                key={`${sc.name}${sc.type}`}
                data-cy={sc.dataCy}
                onChange={sc.handle ?? defaultCheckboxHandler(sc.name)}
              />
              <Typography sx={{ mt: 0.75, fontSize: 15 }}>{sc.label}</Typography>
            </Stack>
          ))}
      </Stack>
      <Button
        variant="contained"
        data-cy="search-button"
        onClick={() => handleSearchButtonClick()}
        startIcon={<Iconify icon="eva:search-fill" width={18} />}
        disabled={loading}
      >
        {loading ? 'Pesquisando...' : 'Pesquisar'}
      </Button>
    </Card>
  );
}
