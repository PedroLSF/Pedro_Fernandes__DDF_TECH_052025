'use client';

import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useFilter } from 'src/hooks/use-filter';
import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
import { fDateEndOfDay, fDateStartOfDay } from 'src/utils/format-time';
import {
  failDeleteText,
  failActiveTexts,
  failInactiveTexts,
  successDeleteText,
  successActiveTexts,
  successInactiveTexts,
} from 'src/utils/message';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import TableToolbar from 'src/components/table/table-toolbar';
import TableSkeleton from 'src/components/table/table-skeleton';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TotalElementsOnTable from 'src/components/table/total-results';
import TableFiltersResult from 'src/components/table/table-filter-results';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { PermissionSlug } from 'src/types/role';
import { IPaginated, defaultPaginated } from 'src/types/pagination';
import { SchemaFilters, SchemaFiltersResults } from 'src/types/generic';
import { IChannel, IChannelTableFilters, CHANNEL_STATUS_OPTIONS } from 'src/types/channel';

import ChannelTableRow from '../channel-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: '', label: 'Todos' }, ...CHANNEL_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Nome' },
  { id: 'type', label: 'Tipo' },
  { id: 'active', label: 'Situação' },
  { id: 'videoChannels._count', label: 'Vídeos' },
  { id: '', label: 'Playlists' },
  { id: 'created_at', label: 'Data de Criação' },
  { id: 'updated_at', label: 'Atualizado em' },
  { id: '', width: 100 },
];

const defaultFilters: IChannelTableFilters = {
  name: '',
  type: '',
  active: '',
  end_date: null,
  start_date: null,
  category_id: null,
};

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
    dataCy: 'type-channel-search',
  },
];

const schemaResults: SchemaFiltersResults[] = [
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
];

// ----------------------------------------------------------------------

export default function ChannelListView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const { can } = useAuthContext();

  const router = useRouter();

  const confirmActivateAll = useBoolean();

  const confirmInactiveAll = useBoolean();

  const theme = useTheme();

  const [data, setData] = useState<IPaginated<IChannel>>(defaultPaginated);
  const [loading, setLoading] = useState<boolean>(false);

  const { filters, handleFilterChange, applyFilters, resetFilters } =
    useFilter<IChannelTableFilters>({
      initialFilters: defaultFilters,
      handler: async (filter) => {
        setLoading(true);
        try {
          const response = await fetcher([
            endpoints.channel.list,
            {
              params: {
                take: table.rowsPerPage,
                skip: table.page * table.rowsPerPage,
                filter: {
                  start_date: filter.start_date ? fDateStartOfDay(filter.start_date) : null,
                  end_date: filter.end_date ? fDateEndOfDay(filter.end_date) : null,
                  ...filter,
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
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          enqueueSnackbar('Erro ao carregar os dados', { variant: 'error' });
        } finally {
          setLoading(false);
        }
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
        axiosInstance.put(`${endpoints.channel.put(row.id)}`, {
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
        axiosInstance.put(`${endpoints.channel.put(row.id)}`, {
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
    async (id: string) => {
      try {
        const deleteRow = data.results.filter((row) => row.id !== id);
        await axiosInstance.delete(endpoints.channel.delete(id));
        enqueueSnackbar(successDeleteText('Canal', true));

        setData((old) => ({ ...old, results: deleteRow }));

        table.onUpdatePageDeleteRow(data?.results?.length || 0);
      } catch (error) {
        enqueueSnackbar(failDeleteText('categoria'), { variant: 'error' });
      }
    },
    [data.results, enqueueSnackbar, table]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.channel.edit(id));
    },
    [router]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Canais"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Lista de canais', href: paths.dashboard.channel.root },
          ]}
          action={
            can(PermissionSlug['add-channels']) && (
              <Button
                component={RouterLink}
                href={paths.dashboard.channel.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                data-cy="create-new-channel"
              >
                Novo Canal
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
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
              boxShadow: (themeArg) =>
                `inset 0 -2px 0 0 ${alpha(themeArg.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.label}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                data-cy={`option-status-${tab.label}`}
              />
            ))}
          </Tabs>

          <TableToolbar
            filters={filters}
            schema={schema}
            onFilters={handleFilterChange}
            setShowFiltersResults={setShowFiltersResults}
            applyFilters={applyFilters}
            loading={loading}
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
              results={loading ? 0 : (data.total ?? 0)}
              isLoading={loading}
              sx={{ p: 2, pt: 0 }}
            />
          )}

          {!canReset && (
            <TotalElementsOnTable results={loading ? 0 : (data.total ?? 0)} isLoading={loading} />
          )}

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
                  {can(PermissionSlug['edit-channels']) && (
                    <Tooltip title="Ativar todos os itens selecionados">
                      <IconButton
                        color="success"
                        onClick={confirmActivateAll.onTrue}
                        data-cy="channel-all-active"
                      >
                        <Iconify icon="solar:check-circle-bold" />
                        <Typography variant="body2" color="success.dark" mx={1}>
                          Ativar Selecionados
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  )}
                  {can(PermissionSlug['edit-channels']) && (
                    <Tooltip title="Inativar Todos">
                      <IconButton
                        color="primary"
                        onClick={confirmInactiveAll.onTrue}
                        data-cy="channel-all-inactive"
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
                  {loading ? (
                    Array.from({ length: table.rowsPerPage }).map((_, index) => (
                      <TableSkeleton key={index} />
                    ))
                  ) : (
                    <>
                      {data.results.map((row) => (
                        <ChannelTableRow
                          key={row.id}
                          row={row}
                          mutate={applyFilters}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onProfileRow={() => router.push(paths.dashboard.channel.profile(row.id))}
                          onAddVideoRow={() =>
                            router.push(paths.dashboard.channel.editTabTwo(row.id))
                          }
                          onCreatePlaylistRow={() =>
                            router.push(paths.dashboard.playlist.new(row.id))
                          }
                        />
                      ))}
                    </>
                  )}

                  {!loading && notFound && (
                    <TableNoData
                      notFound={notFound}
                      sx={{
                        m: -2,
                        borderRadius: 1.5,
                        border: `dashed 1px ${theme.palette.divider}`,
                      }}
                    />
                  )}
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
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
            mutate={() => applyFilters()}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmActivateAll.value}
        onClose={confirmActivateAll.onFalse}
        title="Ativar canals selecionadas"
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
            data-cy="channel-active"
          >
            Ativar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmInactiveAll.value}
        onClose={confirmInactiveAll.onFalse}
        title="Inativar canais selecionadas"
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
            data-cy="channel-inactive"
          >
            Inativar
          </Button>
        }
      />
    </>
  );
}
