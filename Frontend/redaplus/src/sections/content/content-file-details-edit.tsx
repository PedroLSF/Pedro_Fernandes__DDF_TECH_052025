('use-client');

import axios from 'axios';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import TabList from '@mui/lab/TabList';
import Stack from '@mui/material/Stack';
import TabPanel from '@mui/lab/TabPanel';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TabContext from '@mui/lab/TabContext';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import { Paper, Avatar, Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSwitch, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import {
  IVideoTrack,
  VideoStatus,
  IContentItem,
  IContentHistoricTableFilters,
} from 'src/types/content';

import { ITagItem } from '../../types/tag';
import { paths } from '../../routes/paths';
import useFetch from '../../hooks/useFetch';
import { ICategory } from '../../types/category';
import { useTable } from '../../components/table';
import { drawerSettings } from '../../theme/sizes';
import { VideoHumanType } from '../../types/video';
import ContentThumbnail from './content-thumbnail';
import { useFilter } from '../../hooks/use-filter';
import ContentTrackEditor from './content-track-editor';
import { useSweetAlert } from '../../utils/sweet-alert';
import VideoPreview from '../raw-content/video-preview';
import ContentChangeThumb from './content-change-thumb';
import { ILogs, actionTranslation } from '../../types/logs';
import { usePopover } from '../../components/custom-popover';
import { ConfirmDialog } from '../../components/custom-dialog';
import ContentNewTrackDialog from './content-new-track-dialog';
import { LoadingScreen } from '../../components/loading-screen';
import CategorySelector from '../../components/category-selector';
import ContentCaptionThumbnail from './content-caption-thumbnail';
import TableSkeleton from '../../components/table/table-skeleton';
import axiosInstance, { fetcher, endpoints } from '../../utils/axios';
import { IPaginated, defaultPaginated } from '../../types/pagination';
import { failUpdateText, successUpdateText } from '../../utils/message';
import { CopiedState, useCopyToClipboard } from '../../hooks/use-copy-to-clipboard';
import { downloadVideo, downloadVideoTrack, downloadVideoResolution } from '../../utils/video';

// ----------------------------------------------------------------------

type Props = DrawerProps & {
  rowId: string;
  item: IContentItem;
  onClose: VoidFunction;
  onDelete: VoidFunction;
  mutate: VoidFunction;
  category?: string;
  time?: string;
};

export default function ContentFileDetailsEdit({
  item,
  open,
  rowId,
  onClose,
  onDelete,
  mutate,
  category,
  time,
  ...other
}: Props) {
  const { copy } = useCopyToClipboard();
  const router = useRouter();
  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const [isDownloadingResolution, setIsDownloadingResolution] = useState(false);

  const sweetAlert = useSweetAlert();

  const confirmDelete = useBoolean();

  const preview = useBoolean();

  const table = useTable();

  const confirmThumb = useBoolean();

  const popover = usePopover();

  const upload = useBoolean();

  const [skip] = useState<Number>(table.page * table.rowsPerPage);

  const [expanded, setExpanded] = useState<string | false>('panel1');

  const [tabValue, setTabValue] = useState('1');

  const [data, setData] = useState<IPaginated<ILogs>>(defaultPaginated);
  const [loading, setLoading] = useState<boolean>(false);

  const [videoCategory, setVideoCategory] = useState<ICategory | null | undefined>(item?.category);

  const [editorData, setEditorData] = useState<{ track: IVideoTrack; content: string } | null>(
    null
  );

  const isEditorOpen = useBoolean();

  const isInPlaylist = item.videoPlaylist && item.videoPlaylist.length > 0;
  const isNotEncoded = item.status !== VideoStatus.encoded;
  const isMigrated = Boolean(item.samba_file_props);
  const deleteDisabled = isInPlaylist || isNotEncoded || isMigrated;

  const deleteReason: JSX.Element[] = [];
  if (isInPlaylist) {
    deleteReason.push(
      <span key="playlist">
        O vídeo está vinculado a uma playlist.
        <br />
      </span>
    );
  }
  if (isNotEncoded) {
    deleteReason.push(
      <span key="encoded">
        O vídeo precisa estar com status Encodado para ser excluído.
        <br />
      </span>
    );
  }
  if (isMigrated) {
    deleteReason.push(
      <span key="migrated">
        Não é possível excluir vídeos provenientes da migração.
        <br />
      </span>
    );
  }

  const defaultFilters = {
    created_at_from: '',
    created_at_to: '',
    resource_id: rowId,
  };

  const { filters, applyFilters } = useFilter<IContentHistoricTableFilters>({
    initialFilters: defaultFilters,
    handler: async (filter) => {
      setLoading(true);
      try {
        const response = await fetcher([
          endpoints.logs.rawVideo,
          {
            params: {
              take: 50,
              skip: 0,
              filter,
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

  const NewContentSchema = Yup.object().shape({
    description: Yup.string().optional().nullable(),
    tag_ids: Yup.array().optional(),
    title: Yup.string().required('Titulo é obrigatório'),
    active: Yup.boolean().required('Situação é obrigatório'),
    category_id: Yup.string().optional().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      description: item?.description ?? '',
      tag_ids: item?.tags?.map((videoTags) => videoTags?.tag) || [],
      title: item?.title || '',
      active: item?.active || true,
      category_id: item?.category?.id || null || undefined,
    }),
    [item]
  );

  const [tagVideos, setTagVideos] = useState(defaultValues.tag_ids);

  const { data: tagData } = useFetch<{ results: Array<ITagItem> }>(endpoints.tag, {
    params: {
      take: table.rowsPerPage,
      skip,
    },
  });

  const methods = useForm({
    resolver: yupResolver(NewContentSchema),
    defaultValues,
  });

  const { setValue, reset, handleSubmit } = methods;

  useEffect(() => {
    if (item) {
      setValue('description', item.description ?? '');
      setTagVideos(defaultValues?.tag_ids);
      setValue('title', item.title);
      setValue('active', item.active);
    }
  }, [setValue, item, defaultValues]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, []);

  const [copiedState, setCopiedState] = useState<CopiedState>({});

  const onCopy = useCallback(
    (text: string, embedUrl: string, field: keyof CopiedState[string]) => {
      if (text) {
        copy(text).then(() => enqueueSnackbar('Copiado com sucesso!'));
        setCopiedState((prevState) => ({
          ...prevState,
          [embedUrl]: {
            ...prevState[embedUrl],
            [field]: true,
          },
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [copy, enqueueSnackbar]
  );

  const onSubmit = handleSubmit(async (video) => {
    try {
      video.category_id = null;
      if (videoCategory) {
        video.category_id = videoCategory.id;
      }

      video.tag_ids = tagVideos?.map((tag) => tag.id);
      await axiosInstance.put(`${endpoints.video.update(item.id)}`, video);
      reset();
      mutate();
      enqueueSnackbar(successUpdateText('video', true));

      console.info('DATA', video);
    } catch (error) {
      enqueueSnackbar(failUpdateText('video', true), {
        variant: 'error',
      });
      if (error.message) {
        enqueueSnackbar(error.message, {
          variant: 'error',
        });
      }
    }
  });

  const handleChangeTabs = (_: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const onDownload = async (resolution = null) => {
    if (resolution === null) {
      await downloadVideo({
        video_id: item.id,
        onError: (message) => {
          enqueueSnackbar({
            message,
            variant: 'error',
          });
        },
      });
      return;
    }
    setIsDownloadingResolution(true);
    await downloadVideoResolution({
      video_id: item.id,
      resolution,
      onError: (message: string) => {
        enqueueSnackbar({ message, variant: 'error' });
        setIsDownloadingResolution(false);
      },
      onSuccess: (url: string) => {
        setIsDownloadingResolution(false);
        enqueueSnackbar({ message: 'Download URL obtida', variant: 'success' });
        sweetAlert.urlAlert({ title: 'Link de download' }, url);
      },
    });
  };

  const onVideoTrackDownload = async (id: string) => {
    await downloadVideoTrack({
      video_track_id: id,
      onError: (message) => {
        enqueueSnackbar({
          message,
          variant: 'error',
        });
      },
    });
  };

  function sanitizeSubtitleContent(content: string): string {
    const noScripts = content.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

    const noHtml = noScripts.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '');

    const allowedChars = /[^a-zA-ZÀ-ÖØ-öø-ÿ0-9\s.,!?@#$%&*()_+\-=/<>:;'"[\]{}|`~\\]/g;

    return noHtml.replace(allowedChars, '');
  }

  const handleEditTrack = async (track: IVideoTrack) => {
    try {
      const res = await axiosInstance.get(`${endpoints.tracks.getReadPresignedUrl(track.id)}`);
      const response = await axios.get(res?.data?.url, { responseType: 'text' });

      setEditorData({ track, content: response.data });
      isEditorOpen.onTrue();
    } catch (error) {
      enqueueSnackbar('Erro ao carregar a legenda para edição.', { variant: 'error' });
    }
  };

  const handleSaveTrack = async (
    track: IVideoTrack,
    updatedContent: string,
    updatedTitle: string
  ) => {
    try {
      const sanitizedContent = sanitizeSubtitleContent(updatedContent);
      const res = await axiosInstance.get(`${endpoints.tracks.getWritePresignedUrl(track.id)}`);

      await axios.put(res?.data?.url, sanitizedContent, {
        headers: { 'Content-Type': 'text/plain' },
      });

      if (track.approved_by === null) {
        await axiosInstance.put(endpoints.videoTrack.update(track.id), {
          approved_by: user?.id,
          label: updatedTitle,
        });
        enqueueSnackbar('Legenda aprovada com sucesso', { variant: 'success' });
      } else if (track.approved_by && updatedTitle !== track.label) {
        await axiosInstance.put(endpoints.videoTrack.update(track.id), {
          label: updatedTitle,
        });
      }

      enqueueSnackbar('Legenda salva com sucesso', { variant: 'success' });
      mutate();
      isEditorOpen.onFalse();
      setEditorData(null);
    } catch (error) {
      enqueueSnackbar('Erro ao salvar a legenda.', { variant: 'error' });
    }
  };

  const handleCloseEditor = () => {
    setEditorData(null);
    isEditorOpen.onFalse();
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  async function handleDelete() {
    try {
      const response = await axiosInstance.delete(endpoints.video.delete(item.id));
      if (response.status === 200) {
        enqueueSnackbar({ message: 'Video excluído com sucesso', variant: 'success' });
        onClose();
      }
    } catch (error) {
      enqueueSnackbar({ message: 'Erro ao excluir vídeo', variant: 'error' });
      if (error.message) {
        enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    }
  }

  const onVideoTrackDelete = async (id: string) => {
    try {
      const response = await axiosInstance.delete(endpoints.videoTrack.delete(id));
      if (response.status === 200) {
        enqueueSnackbar({ message: 'Legenda excluída com sucesso', variant: 'success' });
        mutate();
      }
    } catch (error) {
      enqueueSnackbar({ message: 'Erro ao excluir legenda', variant: 'error' });
      if (error.message) {
        enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    }
  };

  function handleChangeInitialDateFilters(value: string | Date | number) {
    if ((typeof value === 'string' && value === 'Invalid Date') || Number.isNaN(value)) {
      return;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      filters.created_at_from = new Date(value)?.toISOString();
      return;
    }

    filters.created_at_from = value;
  }

  function handleChangeFinalDateFilters(value: string | Date | number) {
    if ((typeof value === 'string' && value === 'Invalid Date') || Number.isNaN(value)) {
      return;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      filters.created_at_to = new Date(value)?.toISOString();
      return;
    }

    filters.created_at_to = value;
  }

  const renderEmbeds = item.embeds && item.embeds.length > 0 && (
    <>
      <Typography>Embeds</Typography>
      {item?.embeds?.map((embed) => (
        <Accordion
          data-cy={`content-embed-${embed.embed_url}`}
          key={embed.embed_url}
          sx={{ width: '100%', backgroundColor: 'background.paper' }}
          expanded={expanded === embed.embed_url}
          onChange={handleChange(embed.embed_url)}
        >
          <AccordionSummary
            aria-controls="panel1d-content"
            id={embed.embed_url}
            expandIcon={<Iconify icon="ic:round-expand-more" />}
          >
            {embed.title}
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              disabled
              fullWidth
              label="Embed"
              multiline
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copiedState[embed.embed_url]?.embed ? 'Copiado' : 'Copiar'}>
                      <IconButton
                        onClick={() =>
                          onCopy(
                            `<iframe src="${embed.embed_url}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
                            embed.embed_url,
                            'embed'
                          )
                        }
                      >
                        <Iconify
                          icon={
                            copiedState[embed.embed_url]?.embed
                              ? 'eva:checkmark-circle-2-fill'
                              : 'eva:copy-fill'
                          }
                          width={24}
                          color={
                            copiedState[embed.embed_url]?.embed ? 'green !important' : 'inherit'
                          }
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              value={`<iframe src="${embed.embed_url}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`}
              data-cy="content-file-details-edit-midia-iframe"
            />
            <TextField
              disabled
              fullWidth
              label="Url da mídia"
              multiline
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copiedState[embed.embed_url]?.mediaUrl ? 'Copiado' : 'Copiar'}>
                      <IconButton
                        onClick={() => onCopy(embed.embed_url, embed.embed_url, 'mediaUrl')}
                      >
                        <Iconify
                          icon={
                            copiedState[embed.embed_url]?.mediaUrl
                              ? 'eva:checkmark-circle-2-fill'
                              : 'eva:copy-fill'
                          }
                          width={24}
                          color={
                            copiedState[embed.embed_url]?.mediaUrl ? 'green !important' : 'inherit'
                          }
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              value={embed.embed_url}
              sx={{ mt: 3 }}
              data-cy="content-file-details-edit-midia-url"
            />
            <TextField
              disabled
              fullWidth
              label="Id da mídia"
              multiline
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copiedState[embed.embed_url]?.mediaId ? 'Copiado' : 'Copiar'}>
                      <IconButton onClick={() => onCopy(item.id, embed.embed_url, 'mediaId')}>
                        <Iconify
                          icon={
                            copiedState[embed.embed_url]?.mediaId
                              ? 'eva:checkmark-circle-2-fill'
                              : 'eva:copy-fill'
                          }
                          width={24}
                          color={
                            copiedState[embed.embed_url]?.mediaId ? 'green !important' : 'inherit'
                          }
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              value={item.id}
              sx={{ mt: 3 }}
              data-cy="content-file-details-edit-midia-id"
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: drawerSettings.content.width },
        }}
        {...other}
      >
        {isDownloadingResolution ? (
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
        ) : (
          <>
            <Scrollbar sx={{ height: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2.5 }}
              >
                <Typography variant="h6"> Editar detalhes do conteúdo </Typography>
                {item?.human_type === VideoHumanType.raw ? (
                  <Chip
                    size="small"
                    variant="soft"
                    label="Bruto"
                    sx={{ float: 'left' }}
                    icon={<Iconify icon="tabler:wood" color="seagreen" />}
                  />
                ) : (
                  <Chip
                    size="small"
                    variant="soft"
                    label="Editado"
                    sx={{ float: 'left' }}
                    icon={<Iconify icon="solar:clapperboard-edit-bold" color="seagreen" />}
                  />
                )}
              </Stack>

              <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={tabValue}>
                  <Box
                    sx={{
                      borderBottom: 1,
                      borderTop: 1,
                      borderColor: 'divider',
                      pr: 2.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      pl: 2.5,
                    }}
                  >
                    <TabList onChange={handleChangeTabs}>
                      <Tab label="Informações" value="1" data-cy="video-information" />
                      <Tab label="Legendas" value="2" data-cy="video-caption" />
                      <Tab label="Histórico" value="3" data-cy="video-historic" />
                    </TabList>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        display: 'flex',
                        aligcnContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <FormProvider methods={methods}>
                        <RHFSwitch
                          data-cy="content-video-active"
                          checked={item?.active}
                          name="active"
                          label={item?.active ? 'Ativo' : 'Inativo'}
                          color="success"
                        />
                      </FormProvider>
                    </Stack>
                  </Box>
                  <TabPanel value="1" key="tabPanel1">
                    <FormProvider methods={methods}>
                      <Stack spacing={2.5} justifyContent="center">
                        <ContentThumbnail
                          sx={{ width: 64, height: 64 }}
                          item={item}
                          onDownload={onDownload}
                          time={time}
                        />
                        <Divider sx={{ borderStyle: 'dashed' }} />
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="flex-start"
                          spacing={2}
                          sx={{ p: 0 }}
                        >
                          <Button
                            data-cy="content-video-preview-button"
                            onClick={preview.onTrue}
                            variant="contained"
                            startIcon={<Iconify icon="gg:play-button-o" />}
                          >
                            Prévia
                          </Button>

                          <Button
                            data-cy="content-video-change-thumb"
                            onClick={() => {
                              confirmThumb.onTrue();
                              popover.onClose();
                            }}
                            variant="contained"
                            startIcon={<Iconify icon="solar:gallery-edit-linear" />}
                          >
                            Alterar miniatura
                          </Button>
                          <Button
                            onClick={() => {
                              router.push(
                                paths.dashboard.upload_content({
                                  replace_id: item.id,
                                  upload_limit: 1,
                                  replace_title: item.title,
                                  human_type: VideoHumanType.edited,
                                  redirectTo: encodeURI(
                                    `${window.location.href.replace(window.location.search, '')}?selectedVideoId=${item.id}`
                                  ),
                                })
                              );
                            }}
                            startIcon={<Iconify icon="fluent:video-switch-24-regular" />}
                            data-cy="content-video-change-video"
                            variant="contained"
                          >
                            Trocar vídeo
                          </Button>
                        </Stack>
                        <Stack
                          direction="column"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <RHFTextField
                            data-cy="content-video-title"
                            name="title"
                            fullWidth
                            label="Titulo"
                            sx={{ pt: 2.5, pb: 2.5 }}
                          />
                          <RHFTextField
                            data-cy="content-video-description"
                            name="description"
                            fullWidth
                            multiline
                            rows={4}
                            label="Descrição"
                            sx={{ pt: 2.5, pb: 2.5 }}
                          />
                        </Stack>
                        <Card sx={{ py: 1 }} data-cy="video-content-categories">
                          <CategorySelector
                            label="Categoria"
                            value={item.category}
                            onChange={(value) => setVideoCategory(value as ICategory)}
                          />
                        </Card>
                        <Stack direction="column" alignItems="center">
                          <RHFAutocomplete
                            sx={{ width: '100%' }}
                            data-cy="content-video-tags"
                            name="tag_ids"
                            label="Tags"
                            placeholder="Escolha suas tags"
                            multiple
                            value={tagVideos}
                            onChange={(event: React.SyntheticEvent, value: any[]) => {
                              setTagVideos(value);
                            }}
                            options={tagData?.results?.map((option) => option) ?? []}
                            getOptionLabel={(option) =>
                              typeof option === 'string' ? option : option.id
                            }
                            renderOption={(props, option) => (
                              <li {...props} key={option.id}>
                                {typeof option === 'string' ? option : option.name}
                              </li>
                            )}
                            renderTags={(selected, getTagProps) =>
                              selected.map((option, index) => {
                                const tag = tagData?.results?.find(
                                  (items) =>
                                    items.id === (typeof option === 'string' ? option : option.id)
                                );

                                return (
                                  <Chip
                                    {...getTagProps({ index })}
                                    key={index}
                                    label={typeof tag === 'string' ? tag : tag?.name}
                                    size="small"
                                    style={{
                                      backgroundColor: tag?.color || 'gray',
                                      color: 'black',
                                    }}
                                    variant="soft"
                                  />
                                );
                              })
                            }
                          />
                        </Stack>
                        {renderEmbeds}
                      </Stack>
                    </FormProvider>
                  </TabPanel>
                  <TabPanel value="2" key="tabPanel2">
                    <ContentThumbnail sx={{ width: 64, height: 64 }} item={item} />

                    <ContentCaptionThumbnail
                      item={item}
                      onDownload={onVideoTrackDownload}
                      onDelete={onVideoTrackDelete}
                      onEdit={handleEditTrack}
                    />
                    <Stack direction="column" alignItems="center" justifyContent="space-between">
                      <Typography
                        variant="subtitle2"
                        sx={{ pt: 2.5, pb: 2.5 }}
                        data-cy="subtitle-message-content-selected"
                      >
                        As legendas possibilitam que espectadores com problemas auditivos e pessoas
                        que falam outros idiomas tenham acesso ao vídeo. Adicione agora seu arquivo
                        no formato .srt ou .vtt (format UTF-8)
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#212B36',
                        color: 'white',
                        ':hover': { backgroundColor: '#354557' },
                        float: 'right',
                      }}
                      startIcon={<Iconify icon="material-symbols-light:upload-sharp" />}
                      onClick={upload.onTrue}
                      data-cy="add-subtitles-content-selected"
                    >
                      Adicionar Legendas
                    </Button>
                  </TabPanel>
                  <TabPanel value="3" key="tabPanel3">
                    <ContentThumbnail sx={{ width: 64, height: 64 }} item={item} key={item.id} />
                    <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
                    <Stack spacing={1.5} sx={{ mb: 3, px: 2.5, mt: 3 }}>
                      <Stack
                        spacing={2}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box data-cy="initial-date-filter-selected">
                          <DatePicker
                            data-cy="initial-date-filter"
                            label="Data Inicial"
                            onChange={(value: any) => handleChangeInitialDateFilters(value)}
                          />
                        </Box>

                        <Box data-cy="final-date-filter-selected">
                          <DatePicker
                            data-cy="final-date-filter"
                            label="Data Final"
                            onChange={(value: any) => handleChangeFinalDateFilters(value)}
                          />
                        </Box>

                        <Button
                          data-cy="search-data-button"
                          onClick={applyFilters}
                          variant="text"
                          sx={{
                            backgroundColor: '#212B36',
                            color: 'white',
                            ':hover': { backgroundColor: '#354557' },
                            pt: 1.5,
                            pb: 1.5,
                            pl: 3,
                            pr: 3,
                          }}
                        >
                          Pesquisar
                        </Button>
                      </Stack>
                    </Stack>
                    {loading
                      ? Array.from({ length: table.rowsPerPage }).map((_, index) => (
                          <TableSkeleton key={index} />
                        ))
                      : data?.results?.map((log, index) => (
                          <Stack spacing={1.5} sx={{ px: 3, pb: 2, pt: 2 }} key={index}>
                            <Stack direction="row" spacing={2} data-cy={`log-videos-${log.id}`}>
                              <Avatar
                                alt={log.user?.name}
                                src={log.user?.avatar}
                                data-cy={`avatar-log-videos-${log.id}`}
                              />

                              <Paper
                                sx={{
                                  p: 1.5,
                                  flexGrow: 1,
                                  bgcolor: 'background.neutral',
                                }}
                                data-cy={`dialog-box-log-videos-${log.id}`}
                              >
                                <Stack
                                  sx={{ mb: 0.5 }}
                                  alignItems={{ sm: 'center' }}
                                  justifyContent="space-between"
                                  direction={{ xs: 'column', sm: 'row' }}
                                >
                                  <Box
                                    sx={{ typography: 'subtitle2' }}
                                    data-cy={`dialog-box-name-log-videos-${log.id}`}
                                  >
                                    {log.user?.name}
                                  </Box>

                                  <Box
                                    sx={{ typography: 'caption', color: 'text.disabled' }}
                                    data-cy={`dialog-box-createdAt-log-videos-${log.id}`}
                                  >
                                    {fDateTime(log.created_at)}
                                  </Box>
                                </Stack>

                                <Box
                                  sx={{ typography: 'body2', color: 'text.secondary' }}
                                  data-cy={`dialog-action-log-videos-${log.id}`}
                                >
                                  {actionTranslation[log.action]} : {log.description}
                                </Box>
                              </Paper>
                            </Stack>
                          </Stack>
                        ))}
                  </TabPanel>
                </TabContext>
              </Box>
            </Scrollbar>

            <Box sx={{ pt: 2.5, pb: 2.5 }}>
              <Stack direction="row" spacing={2} sx={{ pl: 2.5, pr: 2.5 }}>
                <Button
                  fullWidth
                  variant="soft"
                  color="success"
                  size="large"
                  onClick={onSubmit}
                  startIcon={<Iconify icon="fluent:save-24-regular" />}
                  data-cy="dialog-box-log-videos-save"
                >
                  Salvar
                </Button>

                <Tooltip title={deleteDisabled ? deleteReason : ''}>
                  <Box sx={{ width: '100%', display: 'inline-block' }}>
                    <Button
                      fullWidth
                      variant="soft"
                      color="error"
                      size="large"
                      disabled={deleteDisabled}
                      onClick={() => confirmDelete.onTrue()}
                      startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                      data-cy="dialog-box-log-videos-delete"
                    >
                      Excluir
                    </Button>
                  </Box>
                </Tooltip>
              </Stack>
            </Box>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Excluir conteúdo"
        content="Tem certeza que deseja excluir?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete()}
            data-cy="confirm-delete"
          >
            Excluir
          </Button>
        }
      />

      <VideoPreview currentContent={item} open={preview.value} onClose={preview.onFalse} />

      <ContentNewTrackDialog
        open={upload.value}
        onClose={upload.onFalse}
        video_id={item.id}
        mutate={mutate}
      />

      <ContentChangeThumb
        key={item.id}
        open={confirmThumb.value}
        onClose={confirmThumb.onFalse}
        mutate={mutate}
        currentContent={item}
      />

      {isEditorOpen && editorData && (
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <ContentTrackEditor
              track={editorData.track}
              content={editorData.content}
              onSave={handleSaveTrack}
              onClose={handleCloseEditor}
              open={isEditorOpen.value}
              item={item}
            />
          </Box>
        </Stack>
      )}
    </>
  );
}
