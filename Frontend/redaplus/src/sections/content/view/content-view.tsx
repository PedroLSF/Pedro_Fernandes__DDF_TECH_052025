'use client';

import { isValid } from 'date-fns';
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { tablePaginationClasses } from '@mui/material/TablePagination';
import { Tab, Box, Card, Tabs, alpha, Stack, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useFilter } from 'src/hooks/use-filter';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCancelableAxios } from 'src/hooks/useCancelRequest';

import { fSecondsToHms } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
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
import {
  VideoStatus,
  IContentItem,
  ContentTabsValues,
  CONTENT_STATUS_OPTIONS,
} from 'src/types/content';

import { IVideo } from '../../../types/video';
import ContentTableRow from '../content-table-row';
import { removeExtension } from '../../../utils/video';
import ContentChangeThumb from '../content-change-thumb';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: '', label: 'Todos', dataCy: 'All' }, ...CONTENT_STATUS_OPTIONS];
const WAITING_ENCODE_OPTIONS = [
  { value: 'waiting_encode', label: 'Aguardando encode', dataCy: 'waiting-encode' },
  { value: 'error', label: 'Erro', dataCy: 'error' },
];

const WAITING_TRACK_OPTIONS = [
  {
    value: 'waiting_subtitle',
    label: 'Gerando Legenda (IA)',
    dataCy: 'waiting-subtitle',
  },
  {
    value: 'waiting_approve',
    label: 'Aguardando aprovação da legenda (IA)',
    dataCy: 'waiting-approve',
  },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Título' },
  { id: '', label: 'Informações' },
  { id: 'updated_at', label: 'Datas' },
  { id: 'active', label: 'Situação' },
  { id: '', width: 100 },
];

interface IContentTableFilters {
  id: string;
  name: string;
  end_date: Date | null;
  start_date: Date | null;
  active: string;
  waiting_encode: string;
  error: string;
  waiting_subtitle: string;
  waiting_approve: string;
  category_id: string | null;
  self_created_only: boolean;
  dont_include_category_child: boolean;
  resource_id: string;
}

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
    name: 'id',
    placeholder: 'Digite o ID do vídeo...',
    type: 'ID',
    dataCy: 'type-log-id',
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
  {
    name: 'self_created_only',
    type: 'checkbox',
    dataCy: 'created-by',
    label: 'Meus itens',
  },
  {
    name: 'dont_include_category_child',
    type: 'checkbox',
    dataCy: 'dont_include_category_child',
    label: 'Incluir Subcategorias',
  },
  {
    name: 'not_have_channel',
    type: 'checkbox',
    dataCy: 'not_have_channel',
    label: 'Apenas vídeos sem canais',
  },
];

const schemaResults: SchemaFiltersResults[] = [
  {
    name: 'id',
    parentLabel: 'ID: ',
    type: 'ID',
    dataCy: 'type-log-id',
  },
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
  {
    name: 'self_created_only',
    parentLabel: 'Meus itens: ',
    type: 'checkbox',
    dataCy: 'created-by',
    label: 'Meus itens',
  },
  {
    name: 'dont_include_category_child',
    parentLabel: 'Incluir Subcategorias: ',
    type: 'checkbox',
    dataCy: 'dont_include_category_child',
    label: 'Incluir Subcategorias',
  },
  {
    name: 'not_have_channel',
    parentLabel: 'Apenas vídeos sem canais:',
    type: 'checkbox',
    dataCy: 'not_have_channel',
    label: 'Apenas vídeos sem canais',
  },
];

// ----------------------------------------------------------------------

export default function ContentView() {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({
    defaultOrder: 'desc',
    defaultOrderBy: 'updated_at',
  });

  const { can, currentEntity, CantRequest, canRequest } = useAuthContext();
  const settings = useSettingsContext();

  const confirmActivateAll = useBoolean();

  const confirmInactiveAll = useBoolean();

  const confirmThumb = useBoolean();

  const confirmDeleteAll = useBoolean();

  const theme = useTheme();

  const { fetchWithCancel } = useCancelableAxios();

  const [selectedRowsThumb, setSelectedRowsThumb] = useState<IContentItem[]>();
  const [data, setData] = useState<IPaginated<IContentItem>>(defaultPaginated);
  const [loading, setLoading] = useState<boolean>(false);

  const defaultFilters: IContentTableFilters = {
    id: '',
    name: '',
    end_date: null,
    start_date: null,
    active: '',
    waiting_encode: '',
    error: '',
    waiting_subtitle: '',
    waiting_approve: '',
    category_id: null,
    self_created_only: false,
    dont_include_category_child: false,
    resource_id: '',
  };

  const { filters, handleFilterChange, applyFilters, resetFilters } =
    useFilter<IContentTableFilters>({
      initialFilters: defaultFilters,
      persist: true,
      handler: async (filter) => {
        setLoading(true);
        try {
          const response = await fetchWithCancel(endpoints.video.list, {
            method: 'GET',
            params: {
              take: table.rowsPerPage,
              skip: Number(table.page) * Number(table.rowsPerPage),
              filter: {
                ...filter,
                human_type: 'edited',
                start_date:
                  filter.start_date && isValid(filter.start_date)
                    ? new Date(fDateStartOfDay(filter.start_date)).toISOString()
                    : null,
                end_date:
                  filter.end_date && isValid(filter.end_date)
                    ? new Date(fDateEndOfDay(filter.end_date)).toISOString()
                    : null,
              },
              order: table.orderBy
                ? {
                    [table.orderBy === 'name' ? 'title' : table.orderBy]: table.order,
                  }
                : undefined,
            },
          });

          if (response) {
            const modifiedResponse = {
              ...response,
              results: response.results.map((video: IVideo) => ({
                ...video,
                title: removeExtension(video.title),
              })),
            };
            setData(modifiedResponse);
          }
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        } finally {
          setLoading(false);
        }
      },
    });

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.rowsPerPage, table.page, table.order, table.orderBy]);

  useEffect(() => {
    if (!canRequest) {
      return;
    }
    resetFilters();
    CantRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity]);

  const canReset = !isEqual(defaultFilters, filters);
  const [showFiltersResults, setShowFiltersResults] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      handleFilterChange('category_id', category);
      applyFilters({
        category_id: category,
      });
      setShowFiltersResults(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const notFound = (!data.results.length && canReset) || !data.results.length;

  const handleActiveRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.put(`${endpoints.video.update(row.id)}`, {
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

  const handleSubtitleRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      for (const row of selectedRows) {
        if (row.status !== VideoStatus.encoded) {
          enqueueSnackbar('Um ou mais vídeos ainda não estão encodados!', { variant: 'error' });
          return;
        }
        if (row.tracks?.find((track) => track.auto_generated === true)) {
          enqueueSnackbar('Um ou mais vídeos já têm legendas geradas por IA!', {
            variant: 'error',
          });
          return;
        }
      }

      const promises = selectedRows.map((row) =>
        axiosInstance.post(endpoints.encode.requestGenerateSubtitle, {
          video_id: row.id,
          language: 'pt',
          label: row.title,
        })
      );

      await Promise.all(promises);
      enqueueSnackbar('Legendas Solicitadas!', { variant: 'success' });
      table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar('Falha ao Solicitar geração.', { variant: 'error' });
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleInactiveRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.put(`${endpoints.video.update(row.id)}`, {
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

  const handleDeleteRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.delete(`${endpoints.video.delete(row.id)}`)
      );

      await Promise.all(promises);
      applyFilters();
      enqueueSnackbar(successDeleteText('Conteúdos', false, true));
      table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar(failDeleteText('conteúdos'), { variant: 'error' });
    }
  };

  const handleChangeThumbRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const filteredRows = data.results.filter((row) => tableSelectedSet.has(row.id));
      setSelectedRowsThumb(filteredRows);
      confirmThumb.onTrue();
    } catch (error) {
      enqueueSnackbar(failInactiveTexts('situações', false), { variant: 'error' });
    }
  };

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        const deleteRow = data.results.filter((row) => row.id !== id);
        await axiosInstance.delete(`${endpoints.video.delete(id)}`);
        enqueueSnackbar(successDeleteText('Vídeo', true));

        setData((old) => ({ ...old, results: deleteRow }));

        table.onUpdatePageDeleteRow(data?.results?.length || 0);
      } catch (error) {
        enqueueSnackbar(failDeleteText('Vídeo'), { variant: 'error' });
      }
    },
    [data.results, enqueueSnackbar, table]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Conteúdos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Lista de conteúdos' },
          ]}
          action={
            can(PermissionSlug['upload-content']) && (
              <Button
                data-cy="upload-encode-content-video-button"
                variant="contained"
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                onClick={() =>
                  router.push(paths.dashboard.upload_content({ human_type: 'edited' }))
                }
              >
                Upload e Encode
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card sx={{ p: 2.5 }}>
          <Tabs
            value={
              [
                filters.waiting_subtitle && ContentTabsValues.waiting_subtitle,
                filters.waiting_approve && ContentTabsValues.waiting_approve,
                filters.error && ContentTabsValues.error,
                filters.waiting_encode && ContentTabsValues.waiting_encode,
                filters.active?.toString() || '',
              ].find(Boolean) || ''
            }
            onChange={(e, newValue) => {
              const instantFilter: Partial<typeof filters> = {};
              if (newValue === 'true') {
                instantFilter.active = 'true';
                instantFilter.waiting_encode = '';
                instantFilter.error = '';
                instantFilter.waiting_subtitle = '';
                instantFilter.waiting_approve = '';
              }
              if (newValue === 'false') {
                instantFilter.active = 'false';
                instantFilter.waiting_encode = '';
                instantFilter.error = '';
                instantFilter.waiting_subtitle = '';
                instantFilter.waiting_approve = '';
              }
              if (newValue === '') {
                instantFilter.active = '';
                instantFilter.waiting_encode = '';
                instantFilter.error = '';
                instantFilter.waiting_subtitle = '';
                instantFilter.waiting_approve = '';
              }

              if (newValue === 'waiting_encode') {
                instantFilter.active = '';
                instantFilter.waiting_encode = 'waiting_encode';
                instantFilter.error = '';
                instantFilter.waiting_subtitle = '';
                instantFilter.waiting_approve = '';
              }

              if (newValue === 'error') {
                instantFilter.active = '';
                instantFilter.waiting_encode = '';
                instantFilter.error = 'error';
                instantFilter.waiting_subtitle = '';
                instantFilter.waiting_approve = '';
              }

              if (newValue === 'waiting_approve') {
                instantFilter.active = '';
                instantFilter.waiting_encode = '';
                instantFilter.error = '';
                instantFilter.waiting_subtitle = '';
                instantFilter.waiting_approve = 'waiting_approve';
              }

              if (newValue === 'waiting_subtitle') {
                instantFilter.active = '';
                instantFilter.waiting_encode = '';
                instantFilter.error = '';
                instantFilter.waiting_subtitle = 'waiting_subtitle';
                instantFilter.waiting_approve = '';
              }

              handleFilterChange('waiting_encode', instantFilter.waiting_encode);
              handleFilterChange('error', instantFilter.error);
              handleFilterChange('waiting_subtitle', instantFilter.waiting_subtitle);
              handleFilterChange('waiting_approve', instantFilter.waiting_approve);
              handleFilterChange('active', instantFilter.active);
              applyFilters(instantFilter);
            }}
            sx={{
              px: 2.5,
              boxShadow: (t) => `inset 0 -2px 0 0 ${alpha(t.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                data-cy={tab.dataCy}
                key={tab.label}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
              />
            ))}

            {WAITING_ENCODE_OPTIONS.map((tab) => (
              <Tab
                data-cy={tab.dataCy}
                key={tab.label}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
              />
            ))}

            {WAITING_TRACK_OPTIONS.map((tab) => (
              <Tab
                data-cy={tab.dataCy}
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
            falseShowFiltersResults={false}
            loading={loading}
          />

          <TableFiltersResult
            filters={filters}
            initialFilters={defaultFilters}
            schema={schemaResults}
            showFiltersResults={showFiltersResults}
            setShowFiltersResults={setShowFiltersResults}
            onFilters={handleFilterChange}
            onResetFilters={resetFilters}
            results={loading ? 0 : (data.total ?? 0)}
            isLoading={loading}
            sx={{ p: 2, pt: 0 }}
          />

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
                  <Tooltip title="Gerar legenda de todos vídeos">
                    <IconButton
                      color="primary"
                      onClick={() => {
                        handleSubtitleRows();
                      }}
                      data-cy="content-all-inactive"
                      sx={{ borderRadius: 1 }}
                    >
                      <Box
                        component="img"
                        src="/assets/icons/files/ic_ccBulk.svg"
                        sx={{
                          width: 20,
                          height: 20,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" color="primary" mx={1}>
                        Gerar Legenda
                      </Typography>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Ativar todos os itens selecionados">
                    <IconButton
                      color="success"
                      onClick={confirmActivateAll.onTrue}
                      data-cy="content-all-active"
                      sx={{ borderRadius: 1 }}
                    >
                      <Iconify icon="solar:check-circle-bold" />
                      <Typography variant="body2" color="success.dark" mx={1}>
                        Ativar Selecionados
                      </Typography>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Alterar Todos">
                    <IconButton
                      color="primary"
                      onClick={handleChangeThumbRows}
                      data-cy="content-all-thumb"
                      sx={{ borderRadius: 1 }}
                    >
                      <Iconify icon="material-symbols:image-outline" color="success.dark" />
                      <Typography variant="body2" color="success.dark" mx={1}>
                        Alterar Miniatura
                      </Typography>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Inativar Todos">
                    <IconButton
                      color="primary"
                      onClick={confirmInactiveAll.onTrue}
                      data-cy="content-all-inactive"
                      sx={{ borderRadius: 1 }}
                    >
                      <Iconify icon="solar:close-circle-bold" color="error.dark" />
                      <Typography variant="body2" color="error.dark" mx={1}>
                        Inativar Selecionados
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </>
              }
            />

            <Scrollbar>
              {filters.category_id && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="start"
                  sx={{
                    typography: 'caption',
                    color: 'text.disabled',
                    ml: 2,
                    mb: 2,
                  }}
                >
                  <Iconify icon="solar:clock-circle-bold" mr={0.4} />
                  {data?.metadata?.duration && data?.metadata?.duration > 0
                    ? fSecondsToHms(data?.metadata?.duration)
                    : '-'}
                </Stack>
              )}
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
                          <ContentTableRow
                            key={row.id}
                            row={row}
                            mutate={applyFilters}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            setCategory={setCategory}
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
                  <TableNoData
                    notFound={notFound}
                    sx={{
                      m: -2,
                      borderRadius: 1.5,
                      border: `dashed 1px ${theme.palette.divider}`,
                    }}
                  />
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

      <ConfirmDialog
        open={confirmActivateAll.value}
        onClose={confirmActivateAll.onFalse}
        title="Ativar conteúdos selecionadas"
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
            data-cy="user-active"
          >
            Ativar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmInactiveAll.value}
        onClose={confirmInactiveAll.onFalse}
        title="Inativar conteúdos selecionadas"
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
            data-cy="user-inactive"
          >
            Inativar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmDeleteAll.value}
        onClose={confirmDeleteAll.onFalse}
        title="Excluir conteúdos selecionadas"
        content={
          <>
            Tem certeza que deseja excluir <strong> {table.selected.length} </strong> itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows().then(() => confirmDeleteAll.onFalse());
            }}
            data-cy="user-delete"
          >
            Excluir
          </Button>
        }
      />

      <ContentChangeThumb
        open={confirmThumb.value}
        onClose={confirmThumb.onFalse}
        mutate={applyFilters}
        currentContent={selectedRowsThumb}
      />
    </>
  );
}
