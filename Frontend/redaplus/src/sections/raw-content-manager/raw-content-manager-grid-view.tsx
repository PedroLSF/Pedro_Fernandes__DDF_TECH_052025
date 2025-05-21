import { useSnackbar } from 'notistack';
import React, { useRef, useMemo, useState, Dispatch, useCallback, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { Stack, Modal, Collapse } from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { fSecondsToHms } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { TableProps } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import CategorySelector from 'src/components/category-selector';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IFile } from 'src/types/file-manager';
import { ICategory } from 'src/types/category';
import { IVideoFilters } from 'src/types/video';
import { PermissionSlug } from 'src/types/role';

import { paths } from '../../routes/paths';
import axiosInstance, { endpoints } from '../../utils/axios';
import RawContentManagerFileItem from './raw-content-manager-file-item';
import RawContentManagerFolderItem from './raw-content-manager-folder-item';
import RawContentManagerActionSelected from './raw-content-manager-action-selected';
import RawContentManagerNewFolderDialog from './raw-content-manager-new-folder-dialog';

// ----------------------------------------------------------------------

// const schema: SchemaFilters[] = [
//   {
//     name: 'start_date',
//     label: 'Data Inicial',
//     type: 'date',
//     dataCy: 'initial-date-filters',
//   },
//   {
//     name: 'end_date',
//     label: 'Data Final',
//     type: 'date',
//     dataCy: 'final-date-filters',
//   },
//   {
//     name: 'name',
//     placeholder: 'Digitar...',
//     type: 'text',
//     dataCy: 'type-channel-search',
//   },
//   {
//     name: 'self_created_only',
//     type: 'checkbox',
//     dataCy: 'created-by-filter',
//     label: 'Meus itens',
//   },
//   {
//     name: 'only_videos',
//     type: 'checkbox',
//     dataCy: 'only-videos-filter',
//     label: 'Apenas vídeos',
//   },
//   {
//     name: 'only_files',
//     type: 'checkbox',
//     dataCy: 'only-files-filter',
//     label: 'Apenas arquivos',
//   },
// ];

// const schemaResults: SchemaFiltersResults[] = [
//   {
//     name: 'active',
//     parentLabel: 'Situação: ',
//     type: 'boolean',
//     dataCy: 'action-filters-results',
//   },
//   {
//     name: 'start_date',
//     parentLabel: 'Data Inicial: ',
//     type: 'date',
//     dataCy: 'initial-date-filters-results',
//   },
//   {
//     name: 'end_date',
//     parentLabel: 'Data Final: ',
//     type: 'date',
//     dataCy: 'final-date-filters-results',
//   },
//   {
//     name: 'name',
//     parentLabel: 'Palavra-chave: ',
//     type: 'text',
//     dataCy: 'type-content-search-filters-result',
//   },
//   {
//     name: 'self_created_only',
//     parentLabel: 'Meus itens: ',
//     type: 'checkbox',
//     dataCy: 'created-by-filter',
//     label: 'Meus itens',
//   },
//   {
//     name: 'only_videos',
//     parentLabel: 'Apenas vídeos: ',
//     type: 'checkbox',
//     dataCy: 'only_videos-filter',
//     label: 'Apenas vídeos',
//   },
//   {
//     name: 'only_files',
//     parentLabel: 'Apenas arquivos: ',
//     type: 'checkbox',
//     dataCy: 'only_files-filter',
//     label: 'Apenas arquivos',
//   },
// ];

// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  dataFiltered: IFile[];
  onOpenConfirm: VoidFunction;
  totalVideos: number;
  onOpenDownloadConfirm: VoidFunction;
  onDeleteItem: (id: string, type: 'category' | 'video' | 'file') => void;
  mutate: () => any;
  currentNode?: null | Record<string, any>;
  filtersControl: {
    resetFilters: () => void;
    applyFilters: () => any;
    filters: IVideoFilters;
    defaultFilters: IVideoFilters;
    handleFilterChange: (name: string, value: any) => void;
    setShowFiltersResults: React.Dispatch<React.SetStateAction<boolean>>;
    showFiltersResults: boolean;
    total: number;
  };
  isLoadingFiles: boolean;
  setSorted: Dispatch<SetStateAction<string>>;
  sorted: string;
  setSelectedOptionField: Dispatch<SetStateAction<string>>;
  selectedOptionField: string;
};

export default function RawContentManagerGridView({
  table,
  dataFiltered,
  totalVideos,
  onDeleteItem,
  onOpenConfirm,
  onOpenDownloadConfirm,
  mutate,
  currentNode,
  filtersControl,
  isLoadingFiles,
  setSorted,
  sorted,
  setSelectedOptionField,
  selectedOptionField,
}: Props) {
  const { selected, onSelectRow: onSelectItem, onSelectAllRows: onSelectAllItems } = table;
  const { enqueueSnackbar } = useSnackbar();
  const urlParams = useSearchParams();
  const router = useRouter();
  const node_id = urlParams.get('node_id') ?? null;

  const containerRef = useRef(null);
  const { can } = useAuthContext();

  const sort = usePopover();
  const sortAlfabetica = usePopover();
  const [selectedOption, setSelectedOption] = useState(
    sorted === 'asc' ? 'Crescente' : 'Decrescente'
  );
  const [selectedOptionAlfabetica, setSelectedOptionAlfabetica] = useState(
    selectedOptionField === 'title' ? 'Nome' : 'Data de Modificação'
  );

  const [folderName, setFolderName] = useState('');

  const newFolder = useBoolean();

  const upload = useBoolean();

  const files = useBoolean();

  const popover = usePopover();

  const durationTotal = useMemo(() => {
    const filteredData = dataFiltered.filter((item: IFile) => item.type === 'video');

    return filteredData.reduce((accumulator, item) => {
      const duration = item.video?.original_file_props?.duration ?? 0;
      return accumulator + duration;
    }, 0);
  }, [dataFiltered]);

  const handleChangeFolderName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  }, []);

  const handleAddVideoClick = useCallback(() => {
    if (!node_id) {
      enqueueSnackbar('Selecione o diretório', {
        variant: 'error',
      });
      return;
    }
    router.push(
      paths.dashboard.upload_content({
        human_type: 'raw',
        category_id: node_id,
        directories: '1',
        redirectTo: encodeURI(window.location.href),
      })
    );
  }, [enqueueSnackbar, node_id, router]);

  const handleAddArchiveClick = useCallback(() => {
    if (!node_id) {
      enqueueSnackbar('Selecione o diretório', {
        variant: 'error',
      });
      return;
    }
    router.push(
      paths.dashboard.upload_archive({
        category_id: node_id,
        directories: '1',
        redirectTo: encodeURI(window.location.href),
      })
    );
  }, [enqueueSnackbar, node_id, router]);

  const noFolder = dataFiltered.map((row) => row.id).filter((id) => !id.startsWith('cat_'));

  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [folderSelected, setFolderSelected] = useState<ICategory | null>();
  const confirmChangeFolderAll = useBoolean();

  const handleChangeFolderRows = async () => {
    try {
      const tableSelectedSet = new Set(table.selected);
      const selectedRows = dataFiltered.filter((row) => tableSelectedSet.has(row.id));

      const promises = selectedRows.map((row) => {
        if (row.type === 'file') {
          return axiosInstance.put(endpoints.file.update(row.id), {
            category_id: folderSelected?.id,
          });
        }
        return axiosInstance.put(endpoints.video.update(row.id), {
          category_id: folderSelected?.id,
        });
      });

      await Promise.all(promises);
      filtersControl.applyFilters();
      setFolderSelected(null);
      setIsCategorySelectorOpen(false);
      enqueueSnackbar('Diretórios alterados');
      table.setSelected([]);
      // table.onUpdatePageDeleteRow(data?.results?.length || 0);
    } catch (error) {
      enqueueSnackbar('Erro ao alterar diretório', { variant: 'error' });
    }
  };

  return (
    <>
      <Box ref={containerRef}>
        {node_id && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" alignItems="center">
              <Typography variant="h5"> Adicionar item </Typography>

              <IconButton
                size="small"
                color="primary"
                onClick={popover.onOpen}
                sx={{
                  ml: 1,
                  width: 24,
                  height: 24,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
                data-cy="add-folder"
              >
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            </Stack>

            <Box>
              <Button
                disableRipple
                color="inherit"
                onClick={sortAlfabetica.onOpen}
                endIcon={
                  <Iconify
                    icon={
                      sortAlfabetica.open
                        ? 'eva:arrow-ios-upward-fill'
                        : 'eva:arrow-ios-downward-fill'
                    }
                  />
                }
                sx={{ fontWeight: 'fontWeightSemiBold' }}
              >
                Campo:
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    fontWeight: 'fontWeightBold',
                    textTransform: 'capitalize',
                  }}
                >
                  {selectedOptionAlfabetica}
                </Box>
              </Button>

              <Button
                disableRipple
                color="inherit"
                onClick={sort.onOpen}
                endIcon={
                  <Iconify
                    icon={sort.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                  />
                }
                sx={{ fontWeight: 'fontWeightSemiBold' }}
              >
                Ordem:
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    fontWeight: 'fontWeightBold',
                    textTransform: 'capitalize',
                  }}
                >
                  {selectedOption}
                </Box>
              </Button>
            </Box>
          </Stack>
        )}

        <ListItemText
          sx={{ mb: 2 }}
          primary="Diretórios"
          secondary={`${dataFiltered.filter((item) => item.type === 'folder' && node_id !== item.id).length} diretório(s)`}
          primaryTypographyProps={{ typography: 'h6' }}
          secondaryTypographyProps={{
            typography: 'body2',
            color: 'text.disabled',
          }}
        />

        <Grid container sx={{ maxHeight: '450px' }}>
          <Scrollbar data-cy="scrollbar data-cy" sx={{ maxHeight: '450px' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: '450px' }}>
              {dataFiltered
                .filter((i) => i.type === 'folder' && node_id !== i.id)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((folder) => (
                  <Grid key={folder.id} xs={12} md={3} sx={{ maxWidth: '23%' }}>
                    <RawContentManagerFolderItem
                      folder={folder}
                      selected={selected.includes(folder.id)}
                      onSelect={() => onSelectItem(folder.id)}
                      onDelete={() => onDeleteItem(folder.id, 'category')}
                      sx={{ maxWidth: 'auto' }}
                      mutate={mutate}
                      data-cy={`folder-${folder.id}`}
                    />
                  </Grid>
                ))}
            </Box>
          </Scrollbar>
        </Grid>

        <Divider sx={{ mb: 2, mt: 4, borderStyle: 'dashed' }} />

        {node_id && currentNode?.parent_id !== null && (
          <>
            <ListItemText
              sx={{ mb: 1 }}
              primary="Itens"
              secondary={`1 - ${dataFiltered.filter((item) => item.type !== 'folder').length} de ${totalVideos} arquivo(s)`}
              primaryTypographyProps={{ typography: 'h6' }}
              secondaryTypographyProps={{
                typography: 'body2',
                color: 'text.disabled',
              }}
            />

            {/* <TableToolbar */}
            {/*  filters={filtersControl.filters} */}
            {/*  schema={schema} */}
            {/*  onFilters={filtersControl.handleFilterChange} */}
            {/*  setShowFiltersResults={filtersControl.setShowFiltersResults} */}
            {/*  applyFilters={filtersControl.applyFilters} */}
            {/*  falseShowFiltersResults={false} */}
            {/* /> */}

            {/* <TableFiltersResult */}
            {/*  filters={filtersControl.filters} */}
            {/*  initialFilters={filtersControl.defaultFilters} */}
            {/*  schema={schemaResults} */}
            {/*  showFiltersResults={filtersControl.showFiltersResults} */}
            {/*  setShowFiltersResults={filtersControl.setShowFiltersResults} */}
            {/*  onFilters={filtersControl.handleFilterChange} */}
            {/*  onResetFilters={filtersControl.resetFilters} */}
            {/*  results={filtersControl.total ?? 0} */}
            {/*  sx={{ p: 2, pt: 0 }} */}
            {/* /> */}

            <Stack
              direction="row"
              alignItems="center"
              sx={{
                maxWidth: 0.99,
                whiteSpace: 'nowrap',
                color: 'text.disabled',
                typography: 'body2',
                pb: 1,
                pt: 0,
              }}
            >
              <Iconify
                icon="solar:clock-circle-bold"
                sx={{
                  width: 15,
                  height: 15,
                }}
                mr={0.4}
              />
              {durationTotal ? fSecondsToHms(durationTotal) : '-'}
            </Stack>

            <Collapse in={!files.value} unmountOnExit>
              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                }}
                gap={3}
              >
                {dataFiltered
                  .filter((i) => i.type !== 'folder')
                  .map((file) => (
                    <RawContentManagerFileItem
                      row={file.video || file.file}
                      key={`${file.id}-${file.size}`}
                      file={file}
                      selected={selected.includes(file.id)}
                      onSelect={() => onSelectItem(file.id)}
                      onDelete={() => onDeleteItem(file.id, file.video ? 'video' : 'file')}
                      sx={{ maxWidth: 'auto' }}
                      mutate={mutate}
                    />
                  ))}
              </Box>
            </Collapse>
            {isLoadingFiles ? <LoadingScreen sx={{ mt: 5 }} /> : null}
          </>
        )}

        {!!selected?.length && selected.filter((item) => !item.startsWith('cat_')).length > 0 && (
          <RawContentManagerActionSelected
            numSelected={selected.length}
            rowCount={noFolder.length}
            selected={selected}
            onSelectAllItems={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              selected.length === noFolder.length
                ? onSelectAllItems(false, [])
                : onSelectAllItems(true, noFolder);
            }}
            action={
              <>
                {can(PermissionSlug['edit-raw-videos']) && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="tabler:folder-up" />}
                    onClick={() => setIsCategorySelectorOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    Mover
                  </Button>
                )}
                {!selected.some((item) => item.startsWith('fle_')) && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:download-3-fill" />}
                    onClick={onOpenDownloadConfirm}
                    sx={{ mr: 1 }}
                  >
                    Download
                  </Button>
                )}
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={onOpenConfirm}
                  sx={{ mr: 1 }}
                >
                  Excluir
                </Button>
              </>
            }
          />
        )}
      </Box>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="left-top"
        sx={{ width: 200 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            newFolder.onTrue();
          }}
          disabled={!node_id}
        >
          <Iconify icon="ph:folder-plus" />
          Adicionar diretorio
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            handleAddVideoClick();
          }}
          disabled={!node_id || currentNode?.parent_id === null}
        >
          <Iconify icon="fluent:video-add-20-regular" />
          Adicionar vídeo
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            handleAddArchiveClick();
          }}
          disabled={!node_id || currentNode?.parent_id === null}
        >
          <Iconify icon="iconamoon:file-add-light" />
          Adicionar arquivo
        </MenuItem>
      </CustomPopover>

      <CustomPopover open={sort.open} onClose={sort.onClose} sx={{ width: 140 }}>
        <MenuItem
          key="desc"
          onClick={() => {
            setSelectedOption('Decrescente');
            setSorted('desc');
            sort.onClose();
          }}
        >
          Decrescente
        </MenuItem>
        <MenuItem
          key="asc"
          onClick={() => {
            setSelectedOption('Crescente');
            setSorted('asc');
            sort.onClose();
          }}
        >
          Crescente
        </MenuItem>
      </CustomPopover>

      <CustomPopover
        open={sortAlfabetica.open}
        onClose={sortAlfabetica.onClose}
        sx={{ width: 180 }}
      >
        <MenuItem
          key="desc"
          onClick={() => {
            setSelectedOptionAlfabetica('Nome');
            setSelectedOptionField('title');
            sortAlfabetica.onClose();
          }}
        >
          Nome
        </MenuItem>
        <MenuItem
          key="asc"
          onClick={() => {
            setSelectedOptionAlfabetica('Data de Modificação');
            setSelectedOptionField('updated_at');
            sortAlfabetica.onClose();
          }}
        >
          Data de Modificação
        </MenuItem>
      </CustomPopover>

      <RawContentManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} />

      <RawContentManagerNewFolderDialog
        open={newFolder.value}
        onClose={newFolder.onFalse}
        title="Novo diretório"
        onCreate={async () => {
          newFolder.onFalse();
          setFolderName('');
          if (!node_id) {
            enqueueSnackbar('Selecione o diretório', {
              variant: 'error',
            });
            return;
          }
          if (!folderName || folderName.trim().length === 0) {
            enqueueSnackbar('Digite o nome do diretório', {
              variant: 'error',
            });
            return;
          }
          try {
            const response = await axiosInstance.post(endpoints.directory.create, {
              name: folderName.trim(),
              parent_id: node_id,
              is_directory: true,
              active: true,
            });
            if ([201, 200].includes(response.status)) {
              enqueueSnackbar('Diretório criado com sucesso', {
                variant: 'success',
              });
              await mutate();
            }
          } catch (error) {
            enqueueSnackbar('Falha ao criar o diretório', {
              variant: 'error',
            });
            if (error.message) {
              enqueueSnackbar(error.message, {
                variant: 'error',
              });
            }
          }
        }}
        folderName={folderName}
        onChangeFolderName={handleChangeFolderName}
      />

      <ConfirmDialog
        open={confirmChangeFolderAll.value}
        onClose={confirmChangeFolderAll.onFalse}
        title="Mover vídeos selecionados"
        content={
          <>
            Tem certeza que deseja mover <strong> {table.selected.length} </strong> itens para{' '}
            <strong> {folderSelected?.name ?? '-'} </strong>?
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
              onChange={(value) => setFolderSelected(value as ICategory)}
              directories
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
