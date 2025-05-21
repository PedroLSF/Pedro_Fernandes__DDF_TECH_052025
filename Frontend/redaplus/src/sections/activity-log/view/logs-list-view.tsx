'use client';

import isEqual from 'lodash/isEqual';
import { useState, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import { tablePaginationClasses } from '@mui/material/TablePagination';

import { fDateEndOfDay, fDateStartOfDay } from 'src/utils/format-time';

import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import TableToolbar from 'src/components/table/table-toolbar';
import TableSkeleton from 'src/components/table/table-skeleton';
import TotalElementsOnTable from 'src/components/table/total-results';
import TableFiltersResult from 'src/components/table/table-filter-results';

import { SchemaFilters, SchemaFiltersResults } from 'src/types/generic';

import LogsTableRow from '../logs-table-row';
import { paths } from '../../../routes/paths';
import { useFilter } from '../../../hooks/use-filter';
import { fetcher, endpoints } from '../../../utils/axios';
import { LOGS_STATUS_OPTIONS } from '../../../_mock/_logs';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { IPaginated, defaultPaginated } from '../../../types/pagination';
import { ILogs, actionTranslation, ILogsTableFilters } from '../../../types/logs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from '../../../components/table';

const STATUS_OPTIONS = [{ value: '', label: 'Todos' }, ...LOGS_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: '', label: 'Nome' },
  { id: '', label: 'E-mail' },
  { id: '', label: 'Ação' },
  { id: '', label: 'Descrição' },
  { id: 'created_at', label: 'Data de Criação' },
  { id: '', width: 100 },
];

const defaultFilters: ILogsTableFilters = {
  action: '',
  name: '',
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
    dataCy: 'type-log-name',
  },
];

const schemaResults: SchemaFiltersResults[] = [
  {
    name: 'action',
    parentLabel: 'Ação: ',
    type: 'enum',
    enum: actionTranslation,
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
];

export default function LogsListView() {
  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const table = useTable();

  const theme = useTheme();

  const [data, setData] = useState<IPaginated<ILogs>>(defaultPaginated);
  const [loading, setLoading] = useState<boolean>(false);

  const { filters, handleFilterChange, applyFilters, resetFilters } = useFilter<ILogsTableFilters>({
    initialFilters: defaultFilters,
    handler: async (filter) => {
      setLoading(true);
      try {
        const response = await fetcher([
          endpoints.logs.list,
          {
            params: {
              take: table.rowsPerPage,
              skip: table.page * table.rowsPerPage,
              filter: {
                start_date: filter.start_date ? fDateStartOfDay(filter.start_date) : null,
                end_date: filter.end_date ? fDateEndOfDay(filter.end_date) : null,
                ...filter,
              },
              order:
                table.orderBy === 'created_at'
                  ? {
                      created_at: table.order,
                    }
                  : {
                      created_at: 'desc',
                    },
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Logs"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Lista de activity-log', href: paths.dashboard.logs.root },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card sx={{ p: 2.5 }}>
        <Tabs
          value={filters?.action?.toString()}
          onChange={(e, newValue) => {
            const instantFilter: Partial<typeof filters> = {};
            if (newValue === 'create') {
              instantFilter.action = 'create';
            }
            if (newValue === 'update') {
              instantFilter.action = 'update';
            }
            if (newValue === 'delete') {
              instantFilter.action = 'delete';
            }

            if (newValue === 'sign_in') {
              instantFilter.action = 'sign_in';
            }

            if (newValue === 'change_password') {
              instantFilter.action = 'change_password';
            }

            if (newValue === 'retrieve_password') {
              instantFilter.action = 'retrieve_password';
            }

            if (newValue === 'confirm_retrieve_password') {
              instantFilter.action = 'confirm_retrieve_password';
            }

            if (newValue === 'upload') {
              instantFilter.action = 'upload';
            }

            if (newValue === 'preview') {
              instantFilter.action = 'preview';
            }

            if (newValue === '') {
              instantFilter.action = '';
            }
            handleFilterChange('action', instantFilter.action);
            applyFilters(instantFilter);
          }}
          sx={{
            px: 2.5,
            boxShadow: (themeArg) => `inset 0 -2px 0 0 ${alpha(themeArg.palette.grey[500], 0.08)}`,
          }}
        >
          {STATUS_OPTIONS.map((tab) => (
            <Tab
              data-cy={`filters-log-${tab.label}`}
              key={tab.label}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
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
                    {data.results.length > 0 &&
                      data.results.map((row) => (
                        <LogsTableRow
                          selected={table.selected.includes(row.id)}
                          row={row}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          key={row.id}
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
          dense={table.dense}
          onChangeDense={table.onChangeDense}
          mutate={() => applyFilters()}
          sx={{
            [`& .${tablePaginationClasses.toolbar}`]: {
              borderTopColor: 'transparent',
            },
          }}
        />
      </Card>
    </Container>
  );
}
