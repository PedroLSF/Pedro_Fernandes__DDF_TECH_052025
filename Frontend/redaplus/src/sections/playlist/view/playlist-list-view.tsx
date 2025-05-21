'use client';

import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useParams, useRouter } from 'src/routes/hooks';

import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import TableToolbar from 'src/components/table/table-toolbar';

import { paths } from '../../../routes/paths';
import Iconify from '../../../components/iconify';
import { PermissionSlug } from '../../../types/role';
import { useAuthContext } from '../../../auth/hooks';
import PlaylistTableRow from '../playlist-table-row';
import { useFilter } from '../../../hooks/use-filter';
import { RouterLink } from '../../../routes/components';
import { useBoolean } from '../../../hooks/use-boolean';
import { useSettingsContext } from '../../../components/settings';
import { ConfirmDialog } from '../../../components/custom-dialog';
import axiosInstance, { fetcher, endpoints } from '../../../utils/axios';
import { IPaginated, defaultPaginated } from '../../../types/pagination';
import TotalElementsOnTable from '../../../components/table/total-results';
import { SchemaFilters, SchemaFiltersResults } from '../../../types/generic';
import TableFiltersResult from '../../../components/table/table-filter-results';
import {
  IPlaylistItem,
  IPlaylistTableFilters,
  PLAYLIST_STATUS_OPTIONS,
} from '../../../types/playlist';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
import {
  failDeleteText,
  failActiveTexts,
  failInactiveTexts,
  successDeleteText,
  successActiveTexts,
  successInactiveTexts,
} from '../../../utils/message';

const STATUS_OPTIONS = [{ value: '', label: 'Todos' }, ...PLAYLIST_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Nome' },
  { id: 'videos_count', label: 'Total de videos' },
  { id: 'created_at', label: 'Datas' },
  { id: 'active', label: 'Situação' },
  { id: '', width: 100 },
];

const schema: SchemaFilters[] = [
  {
    name: 'start_date',
    label: 'Data Inicial',
    type: 'date',
    dataCy: 'initial-date-filters',
  },
  {
    name: 'end_date',
    label: 'Data Final',
    type: 'date',
    dataCy: 'final-date-filters',
  },
  {
    name: 'name',
    placeholder: 'Digitar...',
    type: 'text',
    dataCy: 'type-content-search',
  },
  {
    name: 'category_id',
    type: 'category',
  },
];

const schemaResults: SchemaFiltersResults[] = [
  {
    name: 'active',
    parentLabel: 'Situação: ',
    type: 'boolean',
    dataCy: 'action-filters-results',
  },
  {
    name: 'start_date',
    parentLabel: 'Data Inicial: ',
    type: 'date',
    dataCy: 'initial-date-filters-results',
  },
  {
    name: 'end_date',
    parentLabel: 'Data Final: ',
    type: 'date',
    dataCy: 'final-date-filters-results',
  },
  {
    name: 'name',
    parentLabel: 'Palavra-chave: ',
    type: 'text',
    dataCy: 'type-content-search-filters-result',
  },
  {
    name: 'category_id',
    parentLabel: 'Categoria: ',
    type: 'category',
  },
];

export default function PlaylistListView() {
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const table = useTable();

  const defaultFilters: IPlaylistTableFilters = {
    name: '',
    tags_ids: '',
    active: '',
    category_id: null,
    start_date: null,
    end_date: null,
    channel_id: id as string,
  };

  const settings = useSettingsContext();

  const { can } = useAuthContext();

  const router = useRouter();

  const confirmActivateAll = useBoolean();

  const confirmInactiveAll = useBoolean();

  const [data, setData] = useState<IPaginated<IPlaylistItem>>(defaultPaginated);

  const { filters, handleFilterChange, applyFilters, resetFilters } =
    useFilter<IPlaylistTableFilters>({
      initialFilters: { ...defaultFilters, channel_id: id as string },
      handler: async (filter) => {
        const response = await fetcher([
          endpoints.playlist.list,
          {
            params: {
              take: table.rowsPerPage,
              skip: table.page * table.rowsPerPage,
              filter: {
                start_date: filter.start_date ? filter.start_date : null,
                end_date: filter.end_date ? filter.end_date : null,
                channel_id: filter.channel_id,
                category_id: filter.category_id,
                name: filter.name,
                active: filter.active,
              },
              order: table.orderBy
                ? {
                    [table.orderBy]: table.order,
                  }
                : undefined,
            },
          },
        ]);
        setData(response);
      },
    });

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.rowsPerPage, table.page, table.order, table.orderBy]);

  const canReset = !isEqual(defaultFilters, filters);
  const [showFiltersResults, setShowFiltersResults] = useState(false);

  const notFound = (!data.results.length && canReset) || !data.results.length;

  const handleActiveRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.put(`${endpoints.playlist.put(row.id)}`, {
          active: true,
        })
      );

      await Promise.all(promises);
      applyFilters();
      enqueueSnackbar(successActiveTexts('Situações', false));
      table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar(failActiveTexts('situações', false), { variant: 'error' });
    }
  };

  const handleInactiveRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.put(`${endpoints.playlist.put(row.id)}`, {
          active: false,
        })
      );

      await Promise.all(promises);
      applyFilters();
      enqueueSnackbar(successInactiveTexts('Situações', false));
      table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar(failInactiveTexts('situações', false), { variant: 'error' });
    }
  };

  const handleDeleteRow = useCallback(
    async (playlistId: string) => {
      try {
        const deleteRow = data.results.filter((row) => row.id !== id);
        await axiosInstance.delete(endpoints.playlist.delete(playlistId));
        enqueueSnackbar(successDeleteText('Playlist', false));

        setData((old) => ({ ...old, results: deleteRow }));

        table.onUpdatePageDeleteRow(data?.results?.length || 0);
        applyFilters();
      } catch (error) {
        enqueueSnackbar(failDeleteText('playlist'), { variant: 'error' });
      }
    },
    // eslint-disable-next-line
    [data.results, enqueueSnackbar, table]
  );

  const handleEditRow = useCallback(
    (playlistId: string) => {
      router.push(paths.dashboard.playlist.edit(playlistId));
    },
    [router]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {can(PermissionSlug['add-playlists']) && (
            <Button
              component={RouterLink}
              href={paths.dashboard.playlist.new(id as string)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              data-cy="create-new-playlist"
            >
              Nova Playlist
            </Button>
          )}
        </Box>
        <Card>
          <Tabs
            value={filters.active.toString()}
            onChange={(e, newValue) => {
              const instantFilter: Partial<typeof filters> = {};
              if (newValue === 'true') {
                instantFilter.active = true;
              }
              if (newValue === 'false') {
                instantFilter.active = false;
              }
              if (newValue === '') {
                instantFilter.active = '';
              }
              handleFilterChange('active', instantFilter.active);
              applyFilters(instantFilter);
            }}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.label}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                data-cy={`tag-tab-${tab.label}`}
              />
            ))}
          </Tabs>

          <TableToolbar
            filters={filters}
            schema={schema}
            onFilters={handleFilterChange}
            setShowFiltersResults={setShowFiltersResults}
            applyFilters={applyFilters}
            filter_in_channel
          />

          {canReset && showFiltersResults && (
            <TableFiltersResult
              filters={filters}
              initialFilters={defaultFilters}
              schema={schemaResults}
              onFilters={handleFilterChange}
              onResetFilters={resetFilters}
              showFiltersResults={showFiltersResults}
              setShowFiltersResults={setShowFiltersResults}
              results={data.total ?? 0}
              sx={{ p: 2, pt: 0 }}
            />
          )}

          {!canReset && <TotalElementsOnTable results={data.total ?? 0} />}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={data.results.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  data.results.map((row) => row.id)
                )
              }
              action={
                <>
                  {can(PermissionSlug['edit-playlists']) && (
                    <Tooltip title="Ativar todos os itens selecionados">
                      <IconButton
                        color="success"
                        onClick={confirmActivateAll.onTrue}
                        data-cy="playlist-all-active"
                      >
                        <Iconify icon="solar:check-circle-bold" />
                        <Typography variant="body2" color="success.dark" mx={1}>
                          Ativar Selecionados
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  )}
                  {can(PermissionSlug['edit-playlists']) && (
                    <Tooltip title="Inativar Todos">
                      <IconButton
                        color="primary"
                        onClick={confirmInactiveAll.onTrue}
                        data-cy="playlist-all-inactive"
                      >
                        <Iconify icon="solar:close-circle-bold" color="error.dark" />
                        <Typography variant="body2" color="error.dark" mx={1}>
                          Inativar Selecionados
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              }
            />
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={data.results.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      data.results.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {data.results.length > 0 &&
                    data.results.map((row) => (
                      <PlaylistTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={data?.total || 0}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
            mutate={() => applyFilters()}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmActivateAll.value}
        onClose={confirmActivateAll.onFalse}
        title="Ativar playlists selecionadas"
        content={
          <>
            Tem certeza que deseja ativar <strong> {table.selected.length} </strong> itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              handleActiveRows().then(() => confirmActivateAll.onFalse());
            }}
            data-cy="playlist-active"
          >
            Ativar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmInactiveAll.value}
        onClose={confirmInactiveAll.onFalse}
        title="Inativar playlists selecionadas"
        content={
          <>
            Tem certeza que deseja inativar <strong> {table.selected.length} </strong> itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleInactiveRows().then(() => confirmInactiveAll.onFalse());
            }}
            data-cy="playlist-inactive"
          >
            Inativar
          </Button>
        }
      />
    </>
  );
}
