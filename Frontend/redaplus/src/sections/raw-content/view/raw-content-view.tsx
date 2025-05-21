'use client';

import { isValid } from 'date-fns';
import isEqual from 'lodash/isEqual';
import { useState, useEffect } from 'react';

import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { tablePaginationClasses } from '@mui/material/TablePagination';
import {
  Tab,
  Box,
  Card,
  Tabs,
  alpha,
  Modal,
  Stack,
  Button,
  Container,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

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
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import TableToolbar from 'src/components/table/table-toolbar';
import CategorySelector from 'src/components/category-selector';
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

import { ICategory } from 'src/types/category';
import { PermissionSlug } from 'src/types/role';
import { IPaginated, defaultPaginated } from 'src/types/pagination';
import { SchemaFilters, SchemaFiltersResults } from 'src/types/generic';

import { IVideo } from '../../../types/video';
import Scrollbar from '../../../components/scrollbar';
import RawContentTableRow from '../raw-content-table-row';
import { useSweetAlert } from '../../../utils/sweet-alert';
import { LoadingScreen } from '../../../components/loading-screen';
import { downloadVideos, removeExtension } from '../../../utils/video';
import { IContentItem, IContentTableFilters } from '../../../types/content';

const defaultFilters: IContentTableFilters = {
  id: '',
  active: '',
  name: '',
  end_date: null,
  start_date: null,
  category_id: null,
  self_created_only: false,
  dont_include_category_child: false,
  resource_id: '',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos', data_cy: 'all_tab' },
  { value: 'true', label: 'Ativo', data_cy: 'active_tab' },
  { value: 'false', label: 'Inativo', data_cy: 'inactive_tab' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Título' },
  { id: '', label: 'Informações' },
  { id: 'updated_at', label: 'Datas' },
  { id: 'active', label: 'Situação' },
];

const schema: SchemaFilters[] = [
  {
    name: 'category_id',
    label: 'Categoria',
    type: 'category',
    dataCy: 'category_id',
  },
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
  {
    name: 'self_created_only',
    type: 'checkbox',
    dataCy: 'created-by-filter',
    label: 'Meus itens',
  },
  {
    name: 'dont_include_category_child',
    type: 'checkbox',
    dataCy: 'dont_include_category_child',
    label: 'Incluir Subdiretórios',
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
  {
    name: 'self_created_only',
    parentLabel: 'Meus itens: ',
    type: 'checkbox',
    dataCy: 'created-by-filter',
    label: 'Meus itens',
  },
  {
    name: 'dont_include_category_child',
    parentLabel: 'Incluir Subdiretórios: ',
    type: 'checkbox',
    dataCy: 'dont_include_category_child',
    label: 'Incluir Subdiretórios',
  },
];

export default function RawContentView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const sweetAlert = useSweetAlert();

  const theme = useTheme();

  const { can, currentEntity } = useAuthContext();

  const settings = useSettingsContext();

  const confirmActivateAll = useBoolean();

  const confirmInactiveAll = useBoolean();

  const confirmDeleteAll = useBoolean();

  const confirmChangeFolderAll = useBoolean();

  const urlParams = useSearchParams();
  const table = useTable();
  const [isLoading, setIsLoading] = useState(true);
  const [folder, setFolder] = useState<ICategory | null>();
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [data, setData] = useState<IPaginated<IContentItem>>(defaultPaginated);
  const { fetchWithCancel } = useCancelableAxios();

  const { filters, handleFilterChange, applyFilters, resetFilters } =
    useFilter<IContentTableFilters>({
      initialFilters: defaultFilters,
      persist: true,
      handler: async (filter) => {
        setIsLoading(true);
        const response = await fetchWithCancel(endpoints.video.list, {
          method: 'GET',
          params: {
            take: table.rowsPerPage,
            skip: table.page * table.rowsPerPage,
            filter: {
              start_date:
                filter.start_date && isValid(filter.start_date)
                  ? new Date(fDateStartOfDay(filter.start_date)).toISOString()
                  : null,
              end_date:
                filter.end_date && isValid(filter.end_date)
                  ? new Date(fDateEndOfDay(filter.end_date)).toISOString()
                  : null,
              category_id: filter.category_id,
              human_type: 'raw',
              ...(({ start_date, end_date, category_id, ...rest }) => rest)(filter),
            },
            order: table.orderBy
              ? {
                  [table.orderBy === 'name' ? 'title' : table.orderBy]: table.order,
                }
              : undefined,
          },
        });

        const modifiedResponse = {
          ...response,
          results: response.results.map((video: IVideo) => ({
            ...video,
            title: removeExtension(video.title),
          })),
        };

        setData(modifiedResponse);
        setIsLoading(false);
      },
    });

  const onDownload = async () => {
    const tableSelectedSet = new Set(table.selected);
    const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

    setIsDownloading(true);
    await downloadVideos({
      video_ids: selectedRows.map((row) => row.id),
      onError: (message: string) => {
        enqueueSnackbar({ message, variant: 'error' });
        setIsDownloading(false);
      },
      onSuccess: (url: string) => {
        setIsDownloading(false);
        enqueueSnackbar({ message: 'Download URL obtida', variant: 'success' });
        sweetAlert.urlAlert({ title: 'Link de download' }, url);
      },
    });
  };

  const handleActiveRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.put(endpoints.video.update(row.id), { active: true })
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
        axiosInstance.put(endpoints.video.update(row.id), { active: false })
      );

      await Promise.all(promises);
      applyFilters();
      enqueueSnackbar(successInactiveTexts('Situações', false));
      table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar(failInactiveTexts('situações', false), { variant: 'error' });
    }
  };

  const handleChangeFolderRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.put(endpoints.video.update(row.id), { category_id: folder?.id })
      );

      await Promise.all(promises);
      applyFilters();
      setFolder(null);
      setIsCategorySelectorOpen(false);
      enqueueSnackbar('Diretórios alterados');
      table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar('Erro ao alterar diretório', { variant: 'error' });
    }
  };

  const handleDeleteRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = data.results.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) =>
        axiosInstance.delete(endpoints.video.delete(row.id))
      );

      await Promise.all(promises);
      applyFilters();
      enqueueSnackbar(successDeleteText('Vídeos', true));
      table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar(failDeleteText('vídeos'), { variant: 'error' });
    }
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.rowsPerPage, table.page, table.order, table.orderBy]);

  useEffect(() => {
    resetFilters();
    applyFilters({
      category_id: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity]);

  const canReset = !isEqual(defaultFilters, filters);
  const [showFiltersResults, setShowFiltersResults] = useState(false);

  const notFound = (!data.results.length && canReset) || !data.results.length;

  if (isDownloading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 25,
        }}
      >
        <Typography variant="body2" sx={{ mb: 2 }}>
          Seus arquivos estão sendo preparados para o download!
        </Typography>
        <LoadingScreen />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Videos Brutos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Videos Brutos', href: paths.dashboard.raw_content },
          ]}
          action={
            can(PermissionSlug['upload-raw-videos']) && (
              <Button
                data-cy="upload-raw-video-button"
                variant="contained"
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                onClick={() => router.push(paths.dashboard.upload_content({ directories: '1' }))}
              >
                Upload
              </Button>
            )
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card sx={{ p: 2.5 }}>
          <Tabs
            value={filters.active === undefined ? '' : filters.active.toString()}
            onChange={(_, newValue) => {
              const instantFilter: Partial<typeof filters> = {};
              if (newValue === 'true') {
                instantFilter.active = 'true';
              }
              if (newValue === 'false') {
                instantFilter.active = 'false';
              }
              if (newValue === '') {
                instantFilter.active = '';
              }
              handleFilterChange('active', instantFilter.active);
              applyFilters(instantFilter);
            }}
            sx={{
              px: 2.5,
              boxShadow: (t) => `inset 0 -2px 0 0 ${alpha(t.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab, index) => (
              <Tab
                key={`${tab.value}-${index}`}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                data-cy={tab.data_cy}
              />
            ))}
          </Tabs>

          <TableToolbar
            filters={filters}
            schema={schema}
            onFilters={handleFilterChange}
            setShowFiltersResults={setShowFiltersResults}
            applyFilters={applyFilters}
            loading={isLoading}
          />

          <TableFiltersResult
            filters={filters}
            initialFilters={defaultFilters}
            schema={schemaResults}
            showFiltersResults={showFiltersResults}
            setShowFiltersResults={setShowFiltersResults}
            onFilters={handleFilterChange}
            onResetFilters={resetFilters}
            results={isLoading ? 0 : (data.total ?? 0)}
            isLoading={isLoading}
            sx={{ p: 2, pt: 0 }}
          />
          <>
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
                    {can(PermissionSlug['edit-raw-videos']) && (
                      <Tooltip title="Mudar diretório de todos itens selecionados">
                        <IconButton
                          color="info"
                          onClick={() => setIsCategorySelectorOpen(true)}
                          data-cy="raw-content-change-all-selected"
                        >
                          <Iconify icon="tabler:folder-up" />
                          <Typography variant="body2" color="default" mx={1}>
                            Mover Selecionados
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    )}

                    {can(PermissionSlug['download-raw-videos']) && (
                      <Tooltip title="Baixar todos os itens selecionados">
                        <IconButton
                          color="default"
                          onClick={onDownload}
                          data-cy="raw-content-download-all-selected"
                        >
                          <Iconify icon="mingcute:download-3-fill" />
                          <Typography variant="body2" color="default" mx={1}>
                            Baixar Selecionados
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    )}

                    {can(PermissionSlug['edit-raw-videos']) && (
                      <Tooltip title="Ativar todos os itens selecionados">
                        <IconButton
                          color="success"
                          onClick={confirmActivateAll.onTrue}
                          data-cy="raw-content-all-active"
                        >
                          <Iconify icon="solar:check-circle-bold" />
                          <Typography variant="body2" color="success.dark" mx={1}>
                            Ativar Selecionados
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    )}

                    {can(PermissionSlug['edit-raw-videos']) && (
                      <Tooltip title="Inativar Todos">
                        <IconButton
                          color="primary"
                          onClick={confirmInactiveAll.onTrue}
                          data-cy="raw-content-all-inactive"
                        >
                          <Iconify icon="solar:close-circle-bold" color="error.dark" />
                          <Typography variant="body2" color="error.dark" mx={1}>
                            Inativar Selecionados
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    )}
                    {can(PermissionSlug['delete-raw-videos']) && (
                      <Tooltip title="Deletar Todos">
                        <IconButton
                          color="primary"
                          onClick={confirmDeleteAll.onTrue}
                          data-cy="raw-content-delete"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" color="error.dark" />
                          <Typography variant="body2" color="error.dark" mx={1}>
                            Deletar Selecionados
                          </Typography>
                        </IconButton>
                      </Tooltip>
                    )}
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
                    {isLoading ? (
                      Array.from({ length: table.rowsPerPage }).map((_, index) => (
                        <TableSkeleton key={index} />
                      ))
                    ) : (
                      <>
                        {data.results.length > 0 &&
                          data.results.map((row, index) => (
                            <RawContentTableRow
                              key={`${row.id}-${index}`}
                              row={row}
                              mutate={applyFilters}
                              selected={table.selected.includes(row.id)}
                              onSelectRow={() => table.onSelectRow(row.id)}
                            />
                          ))}
                      </>
                    )}

                    {!isLoading && notFound && (
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
          </>
        </Card>
      </Container>
      <ConfirmDialog
        open={confirmActivateAll.value}
        onClose={confirmActivateAll.onFalse}
        title="Ativar vídeos selecionados"
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
            data-cy="raw-content-active"
          >
            Ativar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmInactiveAll.value}
        onClose={confirmInactiveAll.onFalse}
        title="Inativar vídeos selecionados"
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
            data-cy="raw-content-inactive"
          >
            Inativar
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmDeleteAll.value}
        onClose={confirmDeleteAll.onFalse}
        title="Deletar vídeos selecionados"
        content={
          <>
            Tem certeza que deseja deletar <strong> {table.selected.length} </strong> itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              handleDeleteRows().then(() => confirmDeleteAll.onFalse());
            }}
            data-cy="raw-content-delete-confirm"
          >
            Deletar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmChangeFolderAll.value}
        onClose={confirmChangeFolderAll.onFalse}
        title="Mover vídeos selecionados"
        content={
          <>
            Tem certeza que deseja mover <strong> {table.selected.length} </strong> itens para{' '}
            <strong> {folder?.name ?? '-'} </strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              handleChangeFolderRows().then(() => confirmChangeFolderAll.onFalse());
            }}
            data-cy="raw-content-change-confirm"
          >
            Mover
          </Button>
        }
      />

      <Modal
        open={isCategorySelectorOpen}
        onClose={() => setIsCategorySelectorOpen(false)}
        aria-labelledby="category-selector-modal"
        aria-describedby="category-selector-description"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box
            sx={{
              width: 400,
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 1,
              position: 'relative',
            }}
          >
            <CategorySelector
              label="Diretório"
              onChange={(value) => setFolder(value as ICategory)}
              directories={urlParams.has('directories')}
            />
            <Button
              variant="contained"
              data-cy="search-button"
              onClick={() => confirmChangeFolderAll.onTrue()}
              sx={{ mt: 3 }}
              startIcon={<Iconify icon="eva:search-fill" width={18} />}
            >
              Escolher
            </Button>
            <Iconify
              icon="material-symbols-light:close"
              color="red"
              onClick={() => setIsCategorySelectorOpen(false)}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                cursor: 'pointer',
              }}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
}
