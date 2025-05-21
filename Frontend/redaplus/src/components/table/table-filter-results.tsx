import { isValid } from 'date-fns';
import isEqual from 'lodash/isEqual';
import { useState, Dispatch, useEffect, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import Stack, { StackProps } from '@mui/material/Stack';

import Iconify from 'src/components/iconify';
import { enqueueSnackbar } from 'src/components/snackbar';

import { SchemaFiltersResults } from 'src/types/generic';

import { fDate } from '../../utils/format-time';
import { fetcher, endpoints } from '../../utils/axios';
import { fSecondsToHms } from '../../utils/format-number';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: AnyObject;
  initialFilters: AnyObject;
  onFilters: (name: string, value: any) => void;
  onResetFilters: VoidFunction;
  showFiltersResults: boolean;
  schema: Array<SchemaFiltersResults>;
  results: number;
  setShowFiltersResults?: Dispatch<SetStateAction<boolean>>;
  isLoading?: boolean;
};

export default function TableFiltersResult({
  filters,
  initialFilters,
  showFiltersResults,
  setShowFiltersResults,
  onFilters,
  schema,
  onResetFilters,
  results,
  isLoading = false,
  ...other
}: Props) {
  const [selected, setSelected] = useState<string[] | string | null>(null);

  const fetchCategory = async () => {
    try {
      if (Array.isArray(filters.category_id)) {
        const responses = await Promise.all(
          filters.category_id.map(async (categoryId) => {
            const response = await fetcher(endpoints.category.get(categoryId));
            return response.name;
          })
        );
        setSelected(responses);
      } else {
        const response = await fetcher(endpoints.category.get(filters.category_id));
        setSelected(response.name);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao buscar categoria', { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    if (filters.category_id) {
      fetchCategory().then(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category_id]);

  const canReset = !isEqual(initialFilters, filters);

  function safeVal(val: any) {
    if (val instanceof Date) {
      return val.toISOString();
    }
    return val;
  }

  return (
    <Stack spacing={1.5} {...other} data-cy="results-filter">
      <Typography variant="h6">Resultados</Typography>
      {Boolean(filters && initialFilters) && (
        <>
          <Box sx={{ typography: 'body2' }}>
            <strong>{results === 0 && isLoading ? '-' : results}</strong>
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {' '}
              resultados
            </Box>
          </Box>
          {/* Duração do vídeo */}
          {filters.type === 'video' && (
            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
                mt: 1,
              }}
            >
              <Iconify
                icon="solar:clock-circle-bold"
                sx={{
                  width: 15,
                  height: 15,
                  mr: 0.5,
                }}
              />
              {filters.duration ? fSecondsToHms(filters.duration) : '-'}
            </Typography>
          )}
          {showFiltersResults && (
            <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
              {schema.map((sc, index) => {
                if (sc.type === 'enum' && filters[sc.name] && filters[sc.name] !== '' && sc.enum) {
                  return (
                    <Block key={index} label={sc.parentLabel}>
                      <Chip label={safeVal(sc.enum[filters[sc.name]])} size="small" />
                    </Block>
                  );
                }
                if (sc.type === 'category' && filters[sc.name] !== null) {
                  return (
                    <Block key={index} label={sc.parentLabel}>
                      {selected && Array.isArray(selected) && selected.length > 0 ? (
                        selected.map((value, idx) => (
                          <Chip
                            key={idx}
                            label={value}
                            size="small"
                            data-cy="category_filter_label"
                          />
                        ))
                      ) : (
                        <Chip label={selected} size="small" data-cy="category_filter_label" />
                      )}
                    </Block>
                  );
                }
                if (
                  sc.type === 'boolean' &&
                  (filters[sc.name] === true || filters[sc.name] === false)
                ) {
                  return (
                    <Block key={index} label={sc.parentLabel}>
                      <Chip label={filters[sc.name] ? 'Ativo' : 'Inativo'} size="small" />
                    </Block>
                  );
                }
                if (
                  sc.type === 'checkbox' &&
                  (filters[sc.name] === true ||
                    (typeof filters[sc.name] === 'string' && filters[sc.name] !== null))
                ) {
                  return (
                    <Block key={index} label={sc.parentLabel}>
                      <Chip
                        label={filters[sc.name] ? 'Sim' : 'Não'}
                        size="small"
                        data-cy="filter_created_by"
                      />
                    </Block>
                  );
                }
                if (sc.type === 'text' && filters[sc.name] !== '') {
                  return (
                    <Block key={index} label={sc.parentLabel}>
                      <Chip
                        label={safeVal(filters[sc.name])}
                        size="small"
                        data-cy="search_filter_label"
                      />
                    </Block>
                  );
                }
                if (sc.type === 'ID' && filters[sc.name] !== '') {
                  return (
                    <Block key={index} label={sc.parentLabel}>
                      <Chip
                        label={safeVal(filters[sc.name])}
                        size="small"
                        data-cy="search_filter_label"
                      />
                    </Block>
                  );
                }
                if (sc.type === 'date' && isValid(filters[sc.name])) {
                  return (
                    <Block key={index} label={sc.parentLabel}>
                      <Chip label={fDate(filters[sc.name])} size="small" />
                    </Block>
                  );
                }
                return null;
              })}
              {canReset && (
                <Button
                  color="error"
                  onClick={() => {
                    onResetFilters();
                    setShowFiltersResults?.(false);
                  }}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  data-cy="tag-clear-filters"
                >
                  Limpar filtros
                </Button>
              )}
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>
      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
