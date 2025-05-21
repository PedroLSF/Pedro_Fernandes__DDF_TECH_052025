'use client';

import isEqual from 'lodash/isEqual';
import React, { useState, useEffect, useCallback } from 'react';

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

import { fDateEndOfDay, fDateStartOfDay } from 'src/utils/format-time';
import {
  failActiveTexts,
  failDeleteText,
  failInactiveTexts,
  successActiveTexts,
  successDeleteText,
  successInactiveTexts,
} from 'src/utils/message';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
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
import { SchemaFilters, SchemaFiltersResults } from 'src/types/generic';
import { IUserItem, IUserTableFilters, USER_STATUS_OPTIONS } from 'src/types/user';

import { useFilter } from '../../../hooks/use-filter';
import { useBoolean } from '../../../hooks/use-boolean';
import { ConfirmDialog } from '../../../components/custom-dialog';
import axiosInstance, { fetcher, endpoints } from '../../../utils/axios';
import { IPaginated, defaultPaginated } from '../../../types/pagination';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { MenuItem } from '@mui/material';
import EssayTableRow from '../essay-table-row';
import { IEssayItem, IEssayTableFilters } from 'src/types/essay';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: 'Titulo' },
  { id: '', label: 'Tema' },
  { id: '', label: 'Status' },
  { id: '', label: 'Data de Criação' },
  { id: '', width: 88 },
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
    name: 'title',
    placeholder: 'Digitar...',
    type: 'text',
    dataCy: 'type-user-title',
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
    name: 'title',
    parentLabel: 'Titulo: ',
    type: 'text',
    dataCy: 'type-content-search-filters-result',
  },
];

const defaultFilters: IEssayTableFilters = {
  title: '',
  end_date: null,
  start_date: null,
};

// ----------------------------------------------------------------------

export default function EssayListView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();
  const { user } = useAuthContext();

  const router = useRouter();

  const theme = useTheme();

  const [data, setData] = useState<IPaginated<IEssayItem>>(defaultPaginated);
  const [loading, setLoading] = useState<boolean>(false);

  const { filters, handleFilterChange, applyFilters, resetFilters } = useFilter<IEssayTableFilters>(
    {
      initialFilters: defaultFilters,
      handler: async (filter) => {
        setLoading(true);
        try {
          const response = await fetcher([
            endpoints.essay.list,
            {
              params: {
                take: table.rowsPerPage,
                skip: table.page * table.rowsPerPage,
                filter: JSON.stringify({
                  start_date: filter.start_date ? fDateStartOfDay(filter.start_date) : null,
                  end_date: filter.end_date ? fDateEndOfDay(filter.end_date) : null,
                  ...(!user?.is_master && { user_id: user?.id }),
                  ...filter,
                }),
                order: table.orderBy
                  ? JSON.stringify({
                      [table.orderBy]: table.order,
                    })
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
    }
  );

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.rowsPerPage, table.page, table.order, table.orderBy]);

  const canReset = !isEqual(defaultFilters, filters);
  const [showFiltersResults, setShowFiltersResults] = useState(false);

  const notFound = (!data.results.length && canReset) || !data.results.length;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        const deleteRow = data.results.filter((row) => row.id !== id);
        await axiosInstance.delete(endpoints.essay.delete(id));
        enqueueSnackbar(successDeleteText('Usuário', false));

        setData((old) => ({ ...old, results: deleteRow }));

        applyFilters();
      } catch (error) {
        enqueueSnackbar(failDeleteText('redação'), { variant: 'error' });
      }
    },
    [data.results, enqueueSnackbar, table]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.essay.edit(id));
    },
    [router]
  );
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Redações"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Lista de redação' }]}
          action={
            user &&
            user.is_master && (
              <Button
                data-cy="new-user-button"
                component={RouterLink}
                href={paths.dashboard.essay.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Nova Redação
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card sx={{ p: 2.5 }}>
          <TableToolbar
            filters={filters}
            schema={schema}
            onFilters={handleFilterChange}
            applyFilters={applyFilters}
            setShowFiltersResults={setShowFiltersResults}
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
                      {data.results.map((row) => (
                        <EssayTableRow
                          key={row.id}
                          row={row}
                          user={user}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
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
          />
        </Card>
      </Container>
    </>
  );
}
