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

import { useBoolean } from 'src/hooks/use-boolean';

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
import { CATEGORY_STATUS_OPTIONS } from 'src/_mock';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import CategoryTree from 'src/components/category-tree';
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
import { ICategory, ICategoryTableFilters } from 'src/types/category';
import { SchemaFilters, SchemaFiltersResults } from 'src/types/generic';

import CategoryTableRow from '../category-table-row';
import { useFilter } from '../../../hooks/use-filter';
import { IPaginated, defaultPaginated } from '../../../types/pagination';
import axiosInstance, { fetcher, endpoints } from '../../../utils/axios';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: '', label: 'Todos', dataCy: 'todos' }, ...CATEGORY_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: '', label: 'ID' },
  { id: 'active', label: 'Situação' },
  { id: 'created_at', label: 'Data de Criação' },
  { id: '', width: 100 },
];

const defaultFilters: ICategoryTableFilters = {
  name: '',
  active: '',
  end_date: null,
  start_date: null,
  category_id: null,
  only_entities: false,
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
    dataCy: 'type-category-search',
  },
  {
    name: 'only_entities',
    type: 'checkbox',
    dataCy: 'only-entities',
    label: 'Apenas entidades',
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
  {
    name: 'only_entities',
    parentLabel: 'Apenas entidades: ',
    type: 'checkbox',
    dataCy: 'only-entities',
    label: 'Apenas entidades',
  },
];

// ----------------------------------------------------------------------

export default function CategoryListView() {
  const settings = useSettingsContext();
  const { can } = useAuthContext();

  const [currentTab, setCurrentTab] = useState('tree');

  const handleChangeTab = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      <Tab key="tree" iconPosition="end" value="tree" label="Árvore" data-cy="tab-category-tree" />
      <Tab
        key="table"
        iconPosition="end"
        value="table"
        label="Tabela"
        data-cy="tab-category-table"
      />
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Categorias"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Lista de categorias', href: paths.dashboard.category.root },
        ]}
        action={
          can(PermissionSlug['add-categories']) && (
            <Button
              component={RouterLink}
              href={paths.dashboard.category.new}
              variant="contained"
              data-cy="new-category-create"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nova Categoria
            </Button>
          )
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {renderTabs}
      {currentTab === 'tree' && <CategoryTree />}
      {currentTab === 'table' && <CategoryList />}
    </Container>
  );
}

function CategoryList() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const { can } = useAuthContext();

  const router = useRouter();

  const confirmActivateAll = useBoolean();

  const confirmInactiveAll = useBoolean();

  const theme = useTheme();

  const bindParent = (tree: ICategory[]): ICategory[] => {
    const CategoryMap: { [key: string]: ICategory } = {};

    tree.forEach((node) => {
      CategoryMap[node.id] = { ...node, children: [] };
    });

    tree.forEach((node) => {
      if (node.parent_id) {
        const parent = CategoryMap[node.parent_id];
        if (parent) {
          parent?.children?.push(CategoryMap[node.id]);
          CategoryMap[node.id].parent = parent;
        }
      }
    });

    return Object.values(CategoryMap);
  };

  const [data, setData] = useState<IPaginated<ICategory>>(defaultPaginated);
  const [loading, setLoading] = useState<boolean>(false);

  const { filters, handleFilterChange, applyFilters, resetFilters } =
    useFilter<ICategoryTableFilters>({
      initialFilters: defaultFilters,
      handler: async (filter) => {
        setLoading(true);
        try {
          const response = await fetcher([
            endpoints.category.list,
            {
              params: {
                take: table.rowsPerPage,
                skip: table.page * table.rowsPerPage,
                filter: {
                  start_date: filter.start_date ? fDateStartOfDay(filter.start_date) : null,
                  end_date: filter.end_date ? fDateEndOfDay(filter.end_date) : null,
                  only_directories: true,
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
          response.results = bindParent(response.results);
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
        axiosInstance.put(endpoints.category.put(row.id), {
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
        axiosInstance.put(endpoints.category.put(row.id), {
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
        await axiosInstance.delete(endpoints.category.delete(id));
        enqueueSnackbar(successDeleteText('Categoria', false));

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
      router.push(paths.dashboard.category.edit(id));
    },
    [router]
  );
  return (
    <>
      <Card sx={{ p: 2.5 }}>
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
            boxShadow: (themeArg) => `inset 0 -2px 0 0 ${alpha(themeArg.palette.grey[500], 0.08)}`,
          }}
        >
          {STATUS_OPTIONS.map((tab) => (
            <Tab
              key={tab.label}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              data-cy={tab.dataCy}
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

        {!canReset && <TotalElementsOnTable results={loading ? 0 : (data.total ?? 0)} isLoading={loading} />}

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
                {can(PermissionSlug['edit-categories']) && (
                  <Tooltip title="Ativar todos os itens selecionados">
                    <IconButton
                      color="success"
                      onClick={confirmActivateAll.onTrue}
                      data-cy="category-all-active"
                    >
                      <Iconify icon="solar:check-circle-bold" />
                      <Typography variant="body2" color="success.dark" mx={1}>
                        Ativar Selecionados
                      </Typography>
                    </IconButton>
                  </Tooltip>
                )}

                {can(PermissionSlug['edit-categories']) && (
                  <Tooltip title="Inativar Todos">
                    <IconButton
                      color="primary"
                      onClick={confirmInactiveAll.onTrue}
                      data-cy="category-all-inactive"
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
                      <CategoryTableRow
                        mutate={applyFilters}
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
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

      <ConfirmDialog
        open={confirmActivateAll.value}
        onClose={confirmActivateAll.onFalse}
        title="Ativar categorias selecionadas"
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
            data-cy="category-active"
          >
            Ativar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmInactiveAll.value}
        onClose={confirmInactiveAll.onFalse}
        title="Inativar categorias selecionadas"
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
            data-cy="category-inactive"
          >
            Inativar
          </Button>
        }
      />
    </>
  );
}
