'use client';

import { isValid } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Box, Typography } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCancelableAxios } from 'src/hooks/useCancelRequest';

import { useTable } from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';

import { IFile } from 'src/types/file-manager';
import { orderFieldSelected } from 'src/types/general';

import { paths } from '../../../routes/paths';
import { ICategory } from '../../../types/category';
import { useAuthContext } from '../../../auth/hooks';
import { IPaginated } from '../../../types/pagination';
import { useSweetAlert } from '../../../utils/sweet-alert';
import { IVideo, IVideoFilters } from '../../../types/video';
import { IArchive, IArchiveFilters } from '../../../types/archive';
import { LoadingScreen } from '../../../components/loading-screen';
import { downloadVideos, removeExtension } from '../../../utils/video';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import RawContentManagerGridView from '../raw-content-manager-grid-view';
import axiosInstance, { fetcher, endpoints } from '../../../utils/axios';
import RawContentManagerNewFolderDialog from '../raw-content-manager-new-folder-dialog';

// ----------------------------------------------------------------------

export default function RawContentManagerView() {
  const table = useTable({ defaultRowsPerPage: 50 });
  const sweetAlert = useSweetAlert();
  const { currentEntity } = useAuthContext();

  const searchParams = useSearchParams();

  const node_id = searchParams.get('node_id') ?? null;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [sorted, setSorted] = useState('asc');
  const [selectedOptionAlfabetica, setSelectedOptionAlfabetica] = useState('title');

  const [transformedData, setTransformedData] = useState<IFile[]>([]);
  const currentNode = useMemo(
    () => (node_id ? transformedData.find((f) => f.id === node_id) : null),
    [node_id, transformedData]
  );

  const settings = useSettingsContext();

  const confirm = useBoolean();
  const downloadConfirm = useBoolean();

  const upload = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const transformData = useCallback(
    (node: XOR<ICategory, XOR<IVideo, IArchive>>, type: 'video' | 'folder' | 'file'): IFile => ({
      id: node.id,
      name: removeExtension(node.name ?? node.title),
      size: node.original_file_props?.size ?? 0,
      type,
      url: '',
      totalFiles: type === 'folder' ? (node._count?.videos ?? undefined) : undefined,
      totalArchives: type === 'folder' ? (node._count?.files ?? undefined) : undefined,
      totalFolders: type === 'folder' ? (node.children?.length ?? undefined) : undefined,
      createdAt: node.created_at ?? null,
      modifiedAt: node.uploaded_at ?? null,
      video: type === 'video' ? (node as IVideo) : undefined,
      file: type === 'file' ? (node as IArchive) : undefined,
      path: node.path ?? [],
      parent_id: 'parent_id' in node ? node.parent_id : false,
    }),
    []
  );

  const handleDeleteItem = useCallback(async (id: string, type: 'video' | 'category' | 'file') => {
    if (type === 'video') {
      await handleDeleteVideo(id);
      return;
    }
    if (type === 'category') {
      await handleDeleteCategory(id);
    }
    if (type === 'file') {
      await handleDeleteFile(id);
    }
    // eslint-disable-next-line
  }, []);

  const handleDeleteVideo = useCallback(async (id: string) => {
    try {
      confirm.onFalse();
      const response = await axiosInstance.delete(endpoints.video.delete(id));
      if (response.status === 200) {
        enqueueSnackbar({ message: 'Video excluído com sucesso', variant: 'success' });
      }
      void mutate(filters);
    } catch (error) {
      enqueueSnackbar({ message: 'Erro ao excluir vídeo', variant: 'error' });
      if (error.message) {
        enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    }
    // eslint-disable-next-line
  }, []);

  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      confirm.onFalse();
      const response = await axiosInstance.delete(endpoints.category.delete(id));
      if (response.status === 200) {
        enqueueSnackbar({ message: 'Diretório excluída com sucesso', variant: 'success' });
      }
      window.location.reload();
    } catch (error) {
      enqueueSnackbar({ message: 'Erro ao excluir diretório', variant: 'error' });
      if (error.message) {
        enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    }
    // eslint-disable-next-line
  }, []);

  const handleDeleteFile = useCallback(async (id: string) => {
    try {
      confirm.onFalse();
      const response = await axiosInstance.delete(endpoints.file.delete(id));
      if (response.status === 200) {
        enqueueSnackbar({ message: 'Arquivo excluído com sucesso', variant: 'success' });
      }
      void mutate(filters);
    } catch (error) {
      enqueueSnackbar({ message: 'Erro ao excluir arquivo', variant: 'error' });
      if (error.message) {
        enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    }
    // eslint-disable-next-line
  }, []);

  const handleDeleteItems = useCallback(() => {
    const deleteRows = transformedData?.filter((row) => table.selected.includes(row.id));
    deleteRows.forEach((row) => {
      let { type } = row;
      if (row.type === 'video') {
        type = 'video';
      }
      if (row.type === 'folder') {
        type = 'category';
      }
      void handleDeleteItem(row.id, type as 'video' | 'category');
      table.onUpdatePageDeleteRow(transformedData.length || 0);
    });
  }, [transformedData, table, handleDeleteItem]);

  const handleDownloadItems = useCallback(async () => {
    const downloadRows = transformedData?.filter(
      (row) => table.selected.includes(row.id) && row.type === 'video'
    );
    setIsDownloading(true);
    await downloadVideos({
      video_ids: downloadRows.map((row) => row.id),
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

    // eslint-disable-next-line
  }, [transformedData, table, handleDeleteItem]);

  const defaultFilters: IVideoFilters = {
    name: '',
    end_date: null,
    start_date: null,
    self_created_only: false,
    only_videos: false,
    only_files: false,
  };

  const [filters, setFilters] = useState<IVideoFilters>(defaultFilters);
  const [showFiltersResults, setShowFiltersResults] = useState(false);

  const [total, setTotal] = useState<number>(0);
  const handleFilterChange = (name: string, value: any) => {
    setFilters((old: any) => ({
      ...old,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    void mutate(filters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    void mutate(defaultFilters);
  };

  const { fetchWithCancel } = useCancelableAxios();

  const fetchVideoData = useCallback(
    async (selectedFilters: IVideoFilters, page = 1) => {
      const response = await fetchWithCancel(endpoints.video.list, {
        method: 'GET',
        params: {
          take: 50,
          skip: (page - 1) * 50,
          filter: {
            start_date:
              selectedFilters.start_date && isValid(selectedFilters.start_date)
                ? selectedFilters.start_date
                : null,
            end_date:
              selectedFilters.end_date && isValid(selectedFilters.end_date)
                ? selectedFilters.end_date
                : null,
            name: selectedFilters.name,
            self_created_only: selectedFilters.self_created_only === true ? '1' : '0',
            category_id: node_id,
            dont_include_category_child: true,
            only_videos: selectedFilters.only_videos === true ? '1' : '0',
            only_files: selectedFilters.only_files === true ? '1' : '0',
          },
          order: { [selectedOptionAlfabetica]: sorted ?? 'asc' },
        },
      });
      return response as IPaginated<IVideo>;
    },
    [node_id, sorted, selectedOptionAlfabetica, fetchWithCancel]
  );

  const fetchFileData = useCallback(
    async (selectedFilters: IArchiveFilters, page = 1) => {
      const response = await fetcher([
        endpoints.file.list,
        {
          params: {
            take: 50,
            skip: (page - 1) * 50,
            filter: {
              start_date:
                selectedFilters.start_date && isValid(selectedFilters.start_date)
                  ? selectedFilters.start_date
                  : null,
              end_date:
                selectedFilters.end_date && isValid(selectedFilters.end_date)
                  ? selectedFilters.end_date
                  : null,
              name: selectedFilters.name,
              self_created_only: selectedFilters.self_created_only === true ? '1' : '0',
              category_id: node_id,
              dont_include_category_child: true,
              only_videos: selectedFilters.only_videos === true ? '1' : '0',
              only_files: selectedFilters.only_files === true ? '1' : '0',
            },
            order: { [selectedOptionAlfabetica]: sorted ?? 'desc' },
          },
        },
      ]);

      return response as IPaginated<IArchive>;
    },
    [node_id, sorted, selectedOptionAlfabetica]
  );

  const fetchTreeData = useCallback(
    async () =>
      (await fetcher([
        endpoints,
        {
          params: {
            only_directories: true,
            append_path: true,
            filter_category: node_id,
          },
        },
      ])) as Array<ICategory>,
    [node_id]
  );

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNextVideos = useCallback(async () => {
    setIsLoadingFiles(true);
    const nextPage = currentPage + 1;
    const fetchedVideos = await fetchVideoData(filters, nextPage);
    if (!fetchedVideos) return;
    setTransformedData((old) => [
      ...old,
      ...fetchedVideos.results.map((v) => transformData(v, 'video')),
    ]);
    setTotal(fetchedVideos.total);
    setTotalPages(fetchedVideos.totalPages);
    setCurrentPage(nextPage);
    setIsLoadingFiles(false);
  }, [
    filters,
    currentPage,
    fetchVideoData,
    transformData,
    setTransformedData,
    setTotal,
    setTotalPages,
    setCurrentPage,
  ]);

  const fetchNextFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    const nextPage = currentPage + 1;
    const fetchedFiles = await fetchFileData(filters, nextPage);
    if (!fetchedFiles) return;
    setTransformedData((old) => [
      ...old,
      ...fetchedFiles.results.map((v) => transformData(v, 'file')),
    ]);
    setTotal(fetchedFiles.total);
    setTotalPages(fetchedFiles.totalPages);
    setCurrentPage(nextPage);
    setIsLoadingFiles(false);
  }, [
    filters,
    currentPage,
    fetchFileData,
    transformData,
    setTransformedData,
    setTotal,
    setTotalPages,
    setCurrentPage,
  ]);

  const mutate = useCallback(
    async (updatedFilters: IVideoFilters) => {
      setIsLoading(true);
      const tree = await fetchTreeData();
      if (!tree || !Array.isArray(tree)) {
        setIsLoading(false);
        return;
      }
      let sortedData: IFile[] = [];
      const transData: IFile[] = [];
      tree.forEach((node) => {
        transData.push(transformData(node, 'folder'));
        if (node_id && Array.isArray(node.children)) {
          node.children.forEach((ch) => {
            transData.push(transformData(ch, 'folder'));
          });
        }
      });
      if (node_id) {
        const fetchedFiles = await fetchFileData(updatedFilters);
        setTotal(fetchedFiles.total);
        if (!filters.only_videos) {
          setTotalPages(fetchedFiles.totalPages);
        }
        fetchedFiles.results.forEach((file: IArchive) => {
          transData.push(transformData(file, 'file'));
        });

        const fetchedVideos = await fetchVideoData(updatedFilters);
        setTotal(fetchedVideos.total + (fetchedFiles?.total || 0));
        if (!filters.only_files) {
          setTotalPages(fetchedVideos.totalPages);
        }
        fetchedVideos.results.forEach((video: IVideo) => {
          transData.push(transformData(video, 'video'));
        });
      }
      if (
        (!filters.only_videos && !filters.only_files) ||
        (filters.only_files && filters.only_videos)
      ) {
        if (selectedOptionAlfabetica) {
          sortedData = transData.sort(
            orderFieldSelected(selectedOptionAlfabetica as 'title' | 'updated_at', sorted)
          );
        }
      }
      setTransformedData(sortedData.length ? sortedData : transData);
      setIsLoading(false);
      setCurrentPage(1);
    },
    // eslint-disable-next-line
    [node_id, filters, currentPage, sorted, selectedOptionAlfabetica]
  );

  useEffect(() => {
    void mutate(filters);
    table.setSelected([]);
    // eslint-disable-next-line
  }, [node_id, currentEntity]);

  useEffect(() => {
    setShowFiltersResults(false);
    // eslint-disable-next-line
  }, [filters]);

  useEffect(() => {
    void mutate(filters);
    // eslint-disable-next-line
  }, [sorted, selectedOptionAlfabetica]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollHeight } = document.documentElement;
      const scrollTop = Math.ceil(window.scrollY);
      const windowHeight = window.innerHeight;
      const bottom = scrollTop + windowHeight >= scrollHeight;

      if (!isLoading && bottom && totalPages > 0 && currentPage < totalPages) {
        fetchNextVideos();
        fetchNextFiles();
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalPages, currentPage, fetchNextVideos, isLoading, fetchNextFiles]);

  // useEffect(() => {
  //   router.push(paths.dashboard.raw_content_manager(currentEntity ? currentEntity.id : undefined));
  //   router.refresh();
  //   // eslint-disable-next-line
  // }, [currentEntity]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Gerenciador"
          links={[
            { name: 'Raíz', href: paths.dashboard.raw_content_manager() },
            ...(currentNode
              ? [
                  ...((currentNode as any).parent_id === null
                    ? [
                        {
                          name: currentNode.name,
                          href: paths.dashboard.raw_content_manager(currentNode.id),
                        },
                      ]
                    : []),
                  ...currentNode.path.map(({ id, name }) => ({
                    name,
                    href: paths.dashboard.raw_content_manager(id),
                  })),
                  ...((currentNode as any).parent_id !== null
                    ? [
                        {
                          name: currentNode.name,
                          href: paths.dashboard.raw_content_manager(currentNode.id),
                        },
                      ]
                    : []),
                ]
              : []),
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {
          // eslint-disable-next-line no-nested-ternary
          isDownloading ? (
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
          ) : isLoading ? (
            <LoadingScreen />
          ) : (
            <RawContentManagerGridView
              table={table}
              dataFiltered={transformedData}
              onDeleteItem={handleDeleteItem}
              onOpenConfirm={confirm.onTrue}
              onOpenDownloadConfirm={downloadConfirm.onTrue}
              mutate={() => void mutate(filters)}
              currentNode={currentNode}
              totalVideos={total}
              filtersControl={{
                resetFilters,
                applyFilters,
                filters,
                defaultFilters,
                handleFilterChange,
                setShowFiltersResults,
                showFiltersResults,
                total,
              }}
              isLoadingFiles={isLoadingFiles}
              setSorted={setSorted}
              sorted={sorted}
              setSelectedOptionField={setSelectedOptionAlfabetica}
              selectedOptionField={selectedOptionAlfabetica}
            />
          )
        }
      </Container>

      <RawContentManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir"
        content={
          <>
            Tem certeza que deseja excluir esses <strong> {table.selected.length} </strong> itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteItems();
              confirm.onFalse();
            }}
          >
            Excluir
          </Button>
        }
      />

      <ConfirmDialog
        open={downloadConfirm.value}
        onClose={downloadConfirm.onFalse}
        title="Download"
        content={
          <>
            Tem certeza que deseja fazer download de <strong> {table.selected.length} </strong>{' '}
            itens?
          </>
        }
        action={
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              handleDownloadItems();
              downloadConfirm.onFalse();
            }}
          >
            Fazer download
          </Button>
        }
      />
    </>
  );
}
