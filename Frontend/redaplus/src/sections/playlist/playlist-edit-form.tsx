import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem/MenuItem';

import { useParams } from 'src/routes/hooks';

import { useFilter } from 'src/hooks/use-filter';
import { useCancelableAxios } from 'src/hooks/useCancelRequest';

import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';

import { IVideo, IVideoFilters, IVideoPlaylist, VideoHumanType } from 'src/types/video';

import VideoAdded from './video-added';
import VideoPicker from './video-pick';
import axiosInstance, { endpoints } from '../../utils/axios';
import TableToolbar from '../../components/table/table-toolbar';
import { IPaginated, defaultPaginated } from '../../types/pagination';
import { SchemaFilters, SchemaFiltersResults } from '../../types/generic';
import TableFiltersResult from '../../components/table/table-filter-results';
import { IPlaylistItem, PLAYLIST_STATUS_OPTIONS } from '../../types/playlist';
import FormProvider, { RHFSelect, RHFTextField } from '../../components/hook-form';
import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
} from '../../utils/message';

type Props = {
  currentPlaylist: IPlaylistItem;
};

export function PlaylistEditForm({ currentPlaylist }: Props) {
  const { user } = useAuthContext();
  const { allowed_categories } = user ?? {};

  const schema: SchemaFilters[] = [
    {
      name: 'name',
      placeholder: 'Digitar...',
      type: 'text',
      dataCy: 'type-category-search',
    },
    {
      name: 'category_id',
      type: 'category',
    },
  ];

  const schemaResults: SchemaFiltersResults[] = [
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

  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { currentEntity } = useAuthContext();

  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(0);
  const [videoDataAdded, setVideoDataAdded] = useState<IPaginated<IVideo>>(defaultPaginated);
  const [videoPlaylist, setVideoPlaylist] = useState<IVideo[]>([]);
  const [picked, setPicked] = useState<IVideo[]>(videoPlaylist);
  const [selectedVideos, setSelectedVideos] = useState<IVideo[]>([]);
  const [showFiltersResults, setShowFiltersResults] = useState(false);
  const [addOrRemove, setAddOrRemove] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAdded, setLoadingAdded] = useState<boolean>(false);

  useEffect(() => {
    if (selectedVideos.length > 0 && addOrRemove === 'add') {
      void handleAddVideo();
      setSelectedVideos([]);
    }
    if (selectedVideos.length > 0 && addOrRemove === 'addAll') {
      void handleAddAllVideo();
      setSelectedVideos([]);
    }
    if (selectedVideos.length > 0 && addOrRemove === 'remove') {
      void handleRemoveVideo();
      setSelectedVideos([]);
    }
    if (selectedVideos.length > 0 && addOrRemove === 'removeAll') {
      void handleRemoveAllVideo();
      setSelectedVideos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlaylist?.id, selectedVideos, addOrRemove]);

  const defaultFilters: IVideoFilters = {
    name: '',
    end_date: null,
    start_date: null,
    category_id: null,
    human_type: VideoHumanType.edited,
    video_from_channel: currentPlaylist?.channel_id,
  };

  const NewPlaylistSchema = Yup.object().shape({
    name: Yup.string().required('Nome da playlist é obrigatório'),
    channel_id: Yup.string().optional(),
    active: Yup.boolean().required('Situação é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPlaylist?.name || '',
      active: currentPlaylist?.active || true,
      channel_id: currentPlaylist?.channel_id || '',
    }),
    [currentPlaylist]
  );

  const methods = useForm({
    resolver: yupResolver(NewPlaylistSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPlaylist) {
      setValue('name', currentPlaylist.name);
      setValue('active', currentPlaylist.active);
      setPicked(videoPlaylist);
    }
  }, [currentPlaylist, defaultValues, setValue, videoPlaylist]);

  useEffect(() => {
    if (currentPlaylist) {
      reset(defaultValues);
    }
  }, [currentPlaylist, defaultValues, reset]);

  const [videoData, setVideoData] = useState<IPaginated<IVideo>>(defaultPaginated);
  const { fetchWithCancel } = useCancelableAxios();

  const { filters, handleFilterChange, applyFilters, resetFilters } = useFilter<IVideoFilters>({
    initialFilters: defaultFilters,
    handler: async () => {
      setLoading(true);
      try {
        const response = await fetchWithCancel(
          endpoints.video.list,
          {
            method: 'GET',
            params: {
              take: rowsPerPage,
              skip: currentPage * rowsPerPage,
              filter: {
                ...filters,
              },
              order: {
                title: 'asc',
              },
            },
          },
          true
        );

        setVideoData(response);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    resetFilters();
    applyFilters({
      category_id: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity]);

  useEffect(() => {
    if (currentPlaylist?.id) {
      void fetchVideoAdded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlaylist?.id]);

  const fetchVideoAdded = async () => {
    setLoadingAdded(true);
    try {
      const videoOnPlaylist = await fetchWithCancel(
        endpoints.videoPlaylist.list(currentPlaylist?.id as string),
        {
          method: 'GET',
          params: {
            // No Paginate
            take: 1,
            skip: 0,
          },
        },
        true
      );

      setVideoDataAdded(videoOnPlaylist);
      setVideoPlaylist(videoOnPlaylist?.results.map((item: IVideoPlaylist) => item.video));
    } catch (error) {
      console.error(error);
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setLoadingAdded(false);
    }
  };

  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null) => {
      if (event?.currentTarget?.name === 'previous-button') {
        if (currentPage !== videoData?.totalPages) {
          setCurrentPage((prev) => prev - 1);
        }
      }

      if (event?.currentTarget?.name === 'next-button') {
        if (currentPage <= videoData?.totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      }
    },

    [currentPage, videoData?.totalPages]
  );

  const handleAddVideo = async () => {
    const video = selectedVideos[0];

    setPicked((prev) => [...prev, video]);

    enqueueSnackbar('Vídeo(s) adicionado(s) com sucesso', { variant: 'success' });
    enqueueSnackbar('Lembre de atualizar a Playlist!', { variant: 'warning' });
  };

  const handleAddAllVideo = async () => {
    setPicked((prev) => [...prev, ...selectedVideos]);

    enqueueSnackbar('Vídeo(s) adicionado(s) com sucesso', { variant: 'success' });
    enqueueSnackbar('Lembre de atualizar a Playlist!', { variant: 'warning' });
  };

  const handleRemoveVideo = async () => {
    setPicked((prev) =>
      prev.filter((video) => !selectedVideos.some((selected) => selected.id === video.id))
    );

    enqueueSnackbar('Vídeo(s) removido(s) com sucesso', { variant: 'success' });
    enqueueSnackbar('Lembre de atualizar a Playlist!', { variant: 'warning' });
  };

  const handleRemoveAllVideo = async () => {
    setPicked((prev) =>
      prev.filter((video) => !selectedVideos.some((selected) => selected.id === video.id))
    );

    enqueueSnackbar('Vídeo(s) removido(s) com sucesso', { variant: 'success' });
    enqueueSnackbar('Lembre de atualizar a Playlist!', { variant: 'warning' });
  };

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      // Don't change that value
      setCurrentPage(0);
    },
    []
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.channel_id = currentPlaylist?.channel_id;

      // Sync Playlist
      const videoIds = Array.from(picked).map((video) => video.id);
      await axiosInstance.post(endpoints.videoPlaylist.syncVideoPlaylist, {
        playlist_id: id,
        videos_ids: videoIds,
      });

      await axiosInstance.put(endpoints.playlist.put(id as string), data);

      enqueueSnackbar(
        id ? successUpdateText('Playlist', false) : successCreateText('Playlist', false)
      );
    } catch (error) {
      enqueueSnackbar(id ? failUpdateText('playlist', false) : failCreateText('playlist', false), {
        variant: 'error',
      });
      if (error.message) {
        enqueueSnackbar(error.message, {
          variant: 'error',
        });
      }
    }
  });

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ mr: 6 }}>
          <Stack spacing={3} sx={{ p: 3 }}>
            <TextField
              disabled
              label="Nome do Canal"
              data-cy="playlist-name-edit-form"
              value={currentPlaylist?.channel.name}
            />

            <RHFTextField name="name" label="Nome da playlist *" data-cy="playlist-name-new-edit" />

            <RHFSelect name="active" label="Situação" data-cy="new-edit-status">
              {PLAYLIST_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.label} value={status.value as any} data-cy={status.dataCy}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                data-cy="user-save"
              >
                Atualizar Playlist
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>
      </FormProvider>

      <Box sx={{ pt: 3 }}>
        <Grid container spacing={3} sx={{ p: 3 }}>
          <Grid xs={12} md={12}>
            <Box
              rowGap={1}
              columnGap={1}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(1, 1fr)',
              }}
              sx={{ mr: 3 }}
            >
              <TableToolbar
                filters={filters}
                schema={schema}
                onFilters={handleFilterChange}
                setShowFiltersResults={setShowFiltersResults}
                applyFilters={applyFilters}
                filter_in_channel
                channel_id={currentPlaylist.channel_id}
              />
              <TableFiltersResult
                filters={filters}
                initialFilters={defaultFilters}
                schema={schemaResults}
                onFilters={handleFilterChange}
                onResetFilters={resetFilters}
                showFiltersResults={showFiltersResults}
                setShowFiltersResults={setShowFiltersResults}
                results={videoData.total ?? 0}
                sx={{ p: 2, pt: 0 }}
              />
            </Box>
          </Grid>
          <Grid xs={12} md={5.87}>
            <VideoPicker
              title="Adicionar videos a sua playlist"
              list={videoData?.results ?? []}
              picked={picked}
              currentChannel={currentPlaylist?.channel}
              currentPlaylist={currentPlaylist}
              setSelected={setSelectedVideos}
              setAddOrRemove={setAddOrRemove}
              paginationControl={{
                total: videoData?.total,
                currentPage,
                handleChangePage,
                rowsPerPage,
                handleChangeRowsPerPage,
              }}
              isLoading={loading}
            />
          </Grid>
          <Grid xs={12} md={0.25} />
          <Grid xs={12} md={5.87}>
            <VideoAdded
              title="Playlist"
              list={picked}
              currentChannel={currentPlaylist?.channel}
              currentPlaylist={currentPlaylist}
              setSelected={setSelectedVideos}
              setAddOrRemove={setAddOrRemove}
              allowed_categories={allowed_categories}
              setPicked={setPicked}
              isLoading={loadingAdded}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
