import * as Yup from 'yup';
import * as React from 'react';
import { m } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem/MenuItem';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import useFetch from 'src/hooks/useFetch';
import { useFilter } from 'src/hooks/use-filter';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useCancelableAxios } from 'src/hooks/useCancelRequest';

import { isUrl } from 'src/utils/url';
import { fData } from 'src/utils/format-number';
import { categoryPath } from 'src/utils/categoryPath';
import axiosInstance, { endpoints } from 'src/utils/axios';
import {
  invalidText,
  failCreateText,
  failUpdateText,
  failDeleteText,
  successCreateText,
  successUpdateText,
  successDeleteText,
} from 'src/utils/message';

import { useAuthContext } from 'src/auth/hooks';
import { CHANNEL_TABS, ChannelEditTabs, CHANNEL_EDIT_TABS } from 'src/_mock/_channel';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FileThumbnail from 'src/components/file-thumbnail';
import TableToolbar from 'src/components/table/table-toolbar';
import TableFiltersResult from 'src/components/table/table-filter-results';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFUploadImage,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { ITagItem } from 'src/types/tag';
import { IPaginated, defaultPaginated } from 'src/types/pagination';
import { IVideo, IVideoFilters, VideoHumanType } from 'src/types/video';
import { SchemaFilters, SchemaFiltersResults } from 'src/types/generic';
import {
  Color,
  IChannel,
  LogoPosition,
  LOGO_POSITION_TYPES,
  CHANNEL_TYPE_OPTIONS,
  CHANNEL_STATUS_OPTIONS,
} from 'src/types/channel';

import VideoPicker from './video-pick';
import VideoAdded from './video-added';
import VideoPreview from '../raw-content/video-preview';
import ColorPicker from '../../components/hook-form/rhf-color-picker';

// ----------------------------------------------------------------------

type Props = {
  currentChannel?: IChannel;
  mutate?: VoidFunction;
  tab?: string;
};

export default function ChannelNewEditForm({ currentChannel, mutate, tab }: Props) {
  // Schemas
  const schema: SchemaFilters[] = [
    {
      name: 'name',
      placeholder: 'Digitar...',
      type: 'text',
      dataCy: 'type-category-search',
    },
    {
      name: 'not_in_channel_id',
      type: 'checkbox',
      handle: (_: any, value: any) => {
        handleFilterChange('not_in_channel_id', value ? currentChannel?.id : null);
      },
      dataCy: 'not-in-channel-filter',
      label: 'Esconder vídeos associados a esse canal',
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
      name: 'not_in_channel_id',
      type: 'checkbox',
      dataCy: 'not-in-channel-filter',
      parentLabel: 'Esconder vídeos associados a esse canal',
    },
    {
      name: 'category_id',
      parentLabel: 'Categoria: ',
      type: 'category',
    },
  ];

  // Variables
  const preview = useBoolean();
  const previewEnding = useBoolean();
  const router = useRouter();
  const { id } = useParams();
  const { currentEntity, CantRequest, canRequest } = useAuthContext();
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const defaultValues = useMemo(
    () => ({
      name: currentChannel?.name || '',
      active: currentChannel?.active || true,
      type: currentChannel?.type || '',
      description: currentChannel?.description ?? '',
      storage_key: currentChannel?.thumb?.image_url ?? currentChannel?.thumb?.storage_key ?? null,
      logo_storage_key:
        currentChannel?.logo?.image_url ?? currentChannel?.logo?.storage_key ?? null,
      position: currentChannel?.logo?.position ?? null,
      tag_ids: currentChannel?.tagChannels?.map((tagChannel) => tagChannel?.tag) || [],
      video_ids: [],
      domain_names:
        currentChannel?.domainChannels?.map((domainChannel) => domainChannel?.domain) || [],
      color: currentChannel?.color ?? null,
    }),
    [currentChannel]
  );

  const domainNames = useMemo(
    () => defaultValues.domain_names.map((domain) => domain.name),
    [defaultValues.domain_names]
  );
  const initialFields = useMemo(
    () =>
      domainNames.length > 0
        ? domainNames.map((name, index) => ({ id: index + 1, name }))
        : [{ id: 1, name: '' }],
    [domainNames]
  );
  const defaultFilters: IVideoFilters = {
    name: '',
    end_date: null,
    start_date: null,
    category_id: null,
    human_type: VideoHumanType.edited,
    not_in_channel_id: null,
  };

  const [hasLogo, setHasLogo] = useState(defaultValues?.logo_storage_key !== null);

  const NewChannelSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    tag_ids: Yup.array().optional(),
    video_ids: Yup.array().optional(),
    domain_names: Yup.array().optional(),
    description: Yup.string().optional(),
    storage_key: Yup.mixed<any>().nullable(),
    logo_storage_key: hasLogo
      ? Yup.mixed<any>().required('É necessário enviar uma foto')
      : Yup.mixed<any>().nullable(),
    position: hasLogo
      ? Yup.mixed<any>().required('É necessário informar uma posição')
      : Yup.mixed<any>().nullable(),
    active: Yup.boolean().required('Situação é obrigatório'),
    type: Yup.string().required('Tipo do canal é obrigatório'),
    color: Yup.string().nullable(),
  });
  const methods = useForm({
    resolver: yupResolver(NewChannelSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // States
  const [currentPageAdded, setCurrentPageAdded] = useState(0);
  const [videoDataAdded, setVideoDataAdded] = useState<IPaginated<IVideo>>(defaultPaginated);
  const [rowsPerPageAdded, setRowsPerPageAdded] = useState(50);
  const [currentPage, setCurrentPage] = useState(0);
  const [videoData, setVideoData] = useState<IPaginated<IVideo>>(defaultPaginated);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAdded, setLoadingAdded] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [hasAvatar, setHasAvatar] = useState(defaultValues?.storage_key !== null);
  const [channelType, setChannelType] = useState(defaultValues?.type);
  const [colorSelected, setColorSelected] = useState<string | null>(defaultValues?.color || null);
  const [logoSelected, setLogoSelected] = useState(defaultValues?.position || null);
  const [tagChannels, setTagChannels] = useState(defaultValues.tag_ids);
  const [videoChannels, setVideoChannels] = useState<IVideo[]>([]);
  const [picked, setPicked] = useState<IVideo[]>(videoChannels);
  const [selectedVideos, setSelectedVideos] = useState<IVideo[]>([]);
  const [showFiltersResults, setShowFiltersResults] = useState(false);
  const [fields, setFields] = useState(initialFields);
  const [currentTab, setCurrentTab] = useState(tab ?? 'data');
  const [addOrRemove, setAddOrRemove] = useState('');
  const { fetchWithCancel } = useCancelableAxios();

  // UseEffect
  useEffect(() => {
    if (selectedVideos.length > 0 && addOrRemove === 'add') {
      handleAddVideo();
      fetchVideoAdded();
      setSelectedVideos([]);
    }
    if (selectedVideos.length > 0 && addOrRemove === 'remove') {
      handleRemoveVideo();
      fetchVideoAdded();
      setSelectedVideos([]);
    }
    if (selectedVideos.length > 0 && addOrRemove === 'introduction') {
      handleAddVideo(addOrRemove);
      setSelectedVideos([]);
    }
    if (selectedVideos.length > 0 && addOrRemove === 'ending') {
      handleAddVideo(addOrRemove);
      setSelectedVideos([]);
    }
    if (currentChannel?.id) {
      fetchVideoAdded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel?.id, rowsPerPageAdded, currentPageAdded, selectedVideos]);
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, picked, currentTab]);

  useEffect(() => {
    if (currentChannel) {
      setValue('name', currentChannel.name);
      setValue('description', (currentChannel.description as any) ?? '');
      setValue('type', currentChannel.type);
      setValue('color', currentChannel.color);
      setValue('active', currentChannel.active);
      setValue('position', currentChannel?.logo?.position);
      setTagChannels(defaultValues?.tag_ids);
      setPicked(videoChannels);
      setFields(initialFields);
      setChannelType(defaultValues?.type);
      setColorSelected(defaultValues?.color);
      setLogoSelected(defaultValues?.position);
      setHasAvatar(defaultValues?.storage_key !== null);
      setHasLogo(defaultValues?.logo_storage_key !== null);
    }
  }, [setValue, currentChannel, defaultValues, initialFields, videoChannels]);

  // Fetchs
  // TODO - TagSelector
  const { data: tagData } = useFetch<{ results: Array<ITagItem> }>(endpoints.tag, {
    params: {
      take: 10,
      skip: 0,
    },
  });

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
                ...(currentTab === ChannelEditTabs.IntroEnding ? { status: 'encoded' } : {}),
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
    if (!canRequest) {
      return;
    }
    resetFilters();
    CantRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity]);

  // Functions
  const fetchVideoAdded = async () => {
    setLoadingAdded(true);
    try {
      const videoOnChannels = await fetchWithCancel(
        endpoints.video.list,
        {
          method: 'GET',
          params: {
            take: rowsPerPageAdded,
            skip: rowsPerPageAdded * currentPageAdded,
            filter: {
              human_type: VideoHumanType.edited,
              video_from_channel: currentChannel?.id,
            },
          },
        },
        true
      );
      setVideoDataAdded(videoOnChannels);
      setVideoChannels(videoOnChannels?.results);
    } catch (error) {
      console.error(error);
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setLoadingAdded(false);
    }
  };

  const handleChangePageAdded = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null) => {
      if (event?.currentTarget?.name === 'previous-button-added') {
        if (currentPageAdded !== videoDataAdded?.totalPages) {
          setCurrentPageAdded((prev) => prev - 1);
        }
      }

      if (event?.currentTarget?.name === 'next-button-added') {
        if (currentPageAdded <= videoDataAdded?.totalPages) {
          setCurrentPageAdded((prev) => prev + 1);
        }
      }
    },

    [currentPageAdded, videoDataAdded?.totalPages]
  );

  const handleChangeRowsPerPageAdded = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRowsPerPageAdded(parseInt(event.target.value, 10));
      // Don't change that value
      setCurrentPageAdded(0);
    },
    []
  );

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

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      // Don't change that value
      setCurrentPage(0);
    },
    []
  );

  const addField = () => {
    setFields([...fields, { id: fields.length + 1, name: '' }]);
  };

  const removeLastField = () => {
    setFields(fields.slice(0, -1));
  };

  const removeField = (fieldId: any) => {
    const indexToRemove = fields.findIndex((field) => field.id === fieldId);

    if (indexToRemove !== -1) {
      const newFields = [...fields.slice(0, indexToRemove), ...fields.slice(indexToRemove + 1)];
      setFields(newFields);
    }
  };

  const handleFieldChange = (idField: any, value: any) => {
    const updatedFields = fields.map((field) =>
      field.id === idField ? { ...field, name: value } : field
    );
    setFields(updatedFields);
  };

  const handleDeleteImage = async (imageId: string, isThumb: boolean) => {
    try {
      if (isThumb) {
        await axiosInstance.delete(endpoints.thumb.delete(imageId));
      }
      if (!isThumb) {
        await axiosInstance.delete(endpoints.logo.delete(imageId));
      }

      if (mutate) {
        mutate();
      }
      enqueueSnackbar(successDeleteText('Imagem', false));
    } catch (error) {
      enqueueSnackbar(failDeleteText('Imagem'));
      console.error(error);
    }
  };

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangeHasAvatar = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setHasAvatar(event.target.checked);
  }, []);

  const handleChangeHasLogo = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasLogo(event.target.checked);
  }, []);

  const handleAddVideo = async (option?: string) => {
    try {
      if (option === 'introduction') {
        await axiosInstance.put(endpoints.channel.put(id as string), {
          intro_id: selectedVideos[0].id,
        });
        if (mutate) {
          await mutate();
        }
        enqueueSnackbar('Introdução adicionada com sucesso', { variant: 'success' });
      } else if (option === 'ending') {
        await axiosInstance.put(endpoints.channel.put(id as string), {
          ending_id: selectedVideos[0].id,
        });
        if (mutate) {
          await mutate();
        }
        enqueueSnackbar('Encerramento adicionado com sucesso', { variant: 'success' });
      } else {
        const promises = Array.from(selectedVideos).map((video) =>
          axiosInstance.post(endpoints.channel.createVideoFromChannel, {
            channel_id: id,
            video_id: video.id,
          })
        );
        await Promise.all(promises);
        enqueueSnackbar('Vídeo(s) adicionado(s) com sucesso', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar('Error ao adicionar Vídeo(s)', { variant: 'error' });
    }
  };

  const handleRemoveVideo = async (option?: string) => {
    try {
      if (option === 'introduction') {
        await axiosInstance.put(endpoints.channel.put(id as string), {
          intro_id: null,
        });
        if (mutate) {
          await mutate();
        }
        enqueueSnackbar('Introdução removida com sucesso', { variant: 'success' });
      } else if (option === 'ending') {
        await axiosInstance.put(endpoints.channel.put(id as string), {
          ending_id: null,
        });
        if (mutate) {
          await mutate();
        }
        enqueueSnackbar('Encerramento removido com sucesso', { variant: 'success' });
      } else {
        const promises = Array.from(selectedVideos).map((video) =>
          axiosInstance.put(endpoints.channel.removeVideoFromChannel, {
            channel_id: id,
            video_id: video.id,
          })
        );
        await Promise.all(promises);

        enqueueSnackbar('Vídeo(s) removido(s) com sucesso', { variant: 'success' });
        if (currentPageAdded > 0) {
          setCurrentPageAdded((prevState) => prevState - 1);
        }
      }
    } catch (error) {
      enqueueSnackbar('Error ao remover Vídeo(s)', { variant: 'error' });
    }
  };

  // OnSubmit
  const onSubmit = handleSubmit(async (data) => {
    try {
      // --------------
      // Storage Key
      if (
        data.storage_key &&
        typeof data.storage_key !== 'string' &&
        'storage_key' in data.storage_key
      ) {
        data.storage_key = data.storage_key.storage_key;
      }

      if (
        data.logo_storage_key &&
        typeof data.logo_storage_key !== 'string' &&
        'storage_key' in data.logo_storage_key
      ) {
        data.logo_storage_key = data.logo_storage_key.storage_key;
      }

      if (isUrl(data.storage_key)) {
        delete data.storage_key;
      }

      if (isUrl(data.logo_storage_key)) {
        delete data.logo_storage_key;
      }

      // --------------
      // TagIds
      data.tag_ids = tagChannels?.map((tag) => tag.id);

      // --------------
      // DomainNames
      // Verificar
      const regex = /^(?:[a-z0-9]+(?:-[a-z0-9]+)*\.)+[a-z0-9]{2,}(?:\.[a-z0-9]{2,})*$/i;
      const domain_names = fields?.map((field) => field.name);
      const invalidDomains = domain_names.filter((domain) => !regex.test(domain));
      if (channelType === 'private' && invalidDomains.length > 0) {
        enqueueSnackbar(invalidText('Dominio', true), {
          variant: 'error',
        });
      }
      data.domain_names = domain_names;

      // --------------
      // VideosIds
      data.video_ids = picked?.map((video) => video.id);

      // --------------
      // ColorPlayer
      data.color = colorSelected || Color.Blue;

      // --------------
      // Create Channel
      let createdChannel = null;
      if (channelType === 'public' || (channelType === 'private' && invalidDomains.length === 0)) {
        if (id) {
          await axiosInstance.put(endpoints.channel.put(id as string), data);
          router.push(paths.dashboard.channel.profile(id as string));
        }

        if (!id) {
          createdChannel = await axiosInstance.post(endpoints.channel.post, data);
          if (createdChannel.data && 'id' in createdChannel.data) {
            router.push(paths.dashboard.channel.edit(createdChannel.data.id));
          }
        }
        // --------------
        // Snackbar
        reset();
        enqueueSnackbar(id ? successUpdateText('Canal', true) : successCreateText('canal', true));
        console.info(id ? 'update channel' : 'new channel', data);
      }
    } catch (error) {
      enqueueSnackbar(id ? failUpdateText('canal', true) : failCreateText('canal', true), {
        variant: 'error',
      });
      if (error.message) {
        enqueueSnackbar(error.message, {
          variant: 'error',
        });
      }
    }
  });

  // Consoles

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {CHANNEL_TABS.map((_tab) => (
        <Tab
          key={_tab.value}
          iconPosition="end"
          value={_tab.value}
          label={_tab.label}
          data-cy={_tab.dataCy}
        />
      ))}
      {CHANNEL_EDIT_TABS.map((edit_tabs) => (
        <Tab
          key={edit_tabs.value}
          iconPosition="end"
          value={edit_tabs.value}
          label={edit_tabs.label}
          data-cy={edit_tabs.dataCy}
        />
      ))}
    </Tabs>
  );

  const renderDetails = (
    <Grid xs={12} md={12}>
      <Card>
        {!mdUp && <CardHeader title="Details" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <RHFTextField name="name" label="Nome do Canal" data-cy="new-edit-name" />

          <RHFTextField
            name="description"
            label="Descrição"
            multiline
            rows={4}
            data-cy="new-edit-desc"
          />

          <RHFSelect name="active" label="Situação" data-cy="new-edit-status">
            {CHANNEL_STATUS_OPTIONS.map((status) => (
              <MenuItem key={status.label} value={status.value as any} data-cy={status.dataCy}>
                {status.label}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFAutocomplete
            name="tag_ids"
            label="Tags"
            placeholder="Escolha suas tags"
            data-cy="new-edit-tag-options"
            multiple
            value={tagChannels}
            onChange={(event: React.SyntheticEvent, value: any[]) => {
              setTagChannels(value);
            }}
            options={tagData?.results?.map((option) => option) ?? []}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.id)}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {typeof option === 'string' ? option : option.name}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => {
                const tag = tagData?.results?.find(
                  (item) => item.id === (typeof option === 'string' ? option : option.id)
                );

                return (
                  <Chip
                    {...getTagProps({ index })}
                    key={typeof tag === 'string' ? tag : tag?.name}
                    label={typeof tag === 'string' ? tag : tag?.name}
                    size="small"
                    style={{ backgroundColor: tag?.color || 'gray', color: 'black' }}
                    variant="soft"
                    data-cy={`tag-option-${tag?.name}`}
                  />
                );
              })
            }
          />

          <RHFSelect
            name="type"
            label="Tipos de canais"
            value={channelType}
            onChange={(event) => {
              setChannelType(event.target.value);
              setValue('type', event.target.value);
            }}
            data-cy="new-edit-channel-type"
          >
            {CHANNEL_TYPE_OPTIONS.map((type) => (
              <MenuItem key={type.label} value={type.value} data-cy={type.dataCy}>
                {type.label}
              </MenuItem>
            ))}
          </RHFSelect>

          {channelType === 'private' && (
            <Stack direction="column" spacing={2} alignItems="flex-end">
              {fields.map((field, index) => (
                <Box
                  key={`${field.id}-${index}`}
                  style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                >
                  <RHFTextField
                    name={`field_${field.id}`}
                    label={`Dominio ${index + 1}`}
                    value={field.name}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    data-cy={`new-edit-dominio${field.id}`}
                    fullWidth
                    style={{ flexGrow: 1, marginRight: '8px' }}
                  />

                  <IconButton
                    color="primary"
                    onClick={() => removeField(field.id)}
                    data-cy={`new-edit-trash-${field.id}`}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Box>
              ))}
              <Stack direction="row" spacing={2} alignItems="flex-end">
                {fields.length > 1 && (
                  <IconButton color="primary" onClick={removeLastField}>
                    <Iconify icon="solar:trash-bin-trash-bold" data-cy="new-edit-trash" />
                  </IconButton>
                )}

                <IconButton color="primary" onClick={addField}>
                  <Iconify icon="mingcute:add-line" data-cy="new-edit-add" />
                </IconButton>
              </Stack>
            </Stack>
          )}

          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={hasAvatar}
                onChange={handleChangeHasAvatar}
                data-cy="new-edit-has-avatar"
              />
            </TableCell>
            <TableCell>Possui Miniatura?</TableCell>
          </TableRow>

          {hasAvatar && (
            <Box sx={{ mb: 5 }}>
              <RHFUploadImage
                setValue={setValue}
                name="storage_key"
                maxSize={3145728}
                data-cy="new-edit-upload-avatar"
                helperText={
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      <Typography variant="caption">
                        Formatos aceitos: *.jpeg, *.jpg, *.png, *.gif
                        <br /> Tamanho máximo {fData(3145728)}
                      </Typography>
                      {currentChannel && (
                        <IconButton
                          color="error"
                          onClick={async () => {
                            await handleDeleteImage(currentChannel?.thumb?.id, true);
                            if (mutate) {
                              mutate();
                            }
                          }}
                        >
                          <Iconify
                            icon="solar:trash-bin-trash-bold"
                            data-cy="new-edit-avatar-delete"
                          />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                }
              />
            </Box>
          )}

          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={hasLogo}
                onChange={handleChangeHasLogo}
                disabled={Boolean(defaultValues.logo_storage_key)}
                data-cy="new-edit-has-logo"
              />
            </TableCell>
            <TableCell>Possui Logo?</TableCell>
          </TableRow>
          {hasLogo && (
            <Box sx={{ mb: 5 }}>
              <RHFUploadImage
                setValue={setValue}
                name="logo_storage_key"
                maxSize={3145728}
                data-cy="new-edit-upload-logo"
                helperText={
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      <Typography variant="caption">
                        Formatos aceitos: *.jpeg, *.jpg, *.png, *.gif
                        <br /> Tamanho máximo: {fData(3145728)}
                        <br /> Dimensões para logo: largura máxima 200px, altura máxima 100px
                      </Typography>
                      {currentChannel && (
                        <IconButton
                          color="error"
                          onClick={async () => {
                            await handleDeleteImage(currentChannel?.logo?.id, false);
                            if (mutate) {
                              mutate();
                            }
                          }}
                        >
                          <Iconify
                            icon="solar:trash-bin-trash-bold"
                            data-cy="new-edit-avatar-delete"
                          />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                }
              />

              <RHFSelect
                sx={{ mt: 2 }}
                name="position"
                label="Posição"
                value={logoSelected}
                onChange={(event) => {
                  const newValue = event.target.value as LogoPosition;
                  setLogoSelected(newValue);
                  setValue('position', newValue);
                }}
                data-cy="new-edit-logo-position"
              >
                {LOGO_POSITION_TYPES.map((type) => (
                  <MenuItem key={type.label} value={type.value} data-cy={type.dataCy}>
                    {type.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
          )}
          <Box>
            <Typography
              sx={{
                mb: 2,
              }}
            >
              Escolha a cor do player:
            </Typography>
            <ColorPicker selectedColor={colorSelected} onSelectColor={setColorSelected} />
          </Box>
        </Stack>
      </Card>
    </Grid>
  );

  const renderVideoPicker = (
    <Grid container spacing={3}>
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
          title="Adicionar vídeos ao seu canal"
          list={videoData?.results ?? []}
          picked={picked}
          currentChannel={currentChannel}
          setSelected={setSelectedVideos}
          setAddOrRemove={setAddOrRemove}
          currentTab={currentTab}
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
          title="Canal"
          list={picked}
          currentChannel={currentChannel}
          setSelected={setSelectedVideos}
          setAddOrRemove={setAddOrRemove}
          paginationControl={{
            totalAdded: videoDataAdded?.total,
            currentPageAdded,
            handleChangePageAdded,
            rowsPerPageAdded,
            handleChangeRowsPerPageAdded,
          }}
          isLoading={loadingAdded}
        />
      </Grid>
    </Grid>
  );

  const renderIntroPicker = (
    <Grid container spacing={3}>
      <VideoPreview
        currentContent={currentChannel?.intro as any}
        open={preview.value}
        onClose={preview.onFalse}
      />

      <Grid xs={12} md={12}>
        {!currentChannel?.intro_id ? (
          <VideoPicker
            title="Adicionar introdução ao seu canal"
            list={videoData?.results ?? []}
            picked={picked}
            currentChannel={currentChannel}
            setSelected={setSelectedVideos}
            setAddOrRemove={setAddOrRemove}
            currentTab="intro"
            paginationControl={{
              total: videoData?.total,
              currentPage,
              handleChangePage,
              rowsPerPage,
              handleChangeRowsPerPage,
            }}
            isLoading={loading}
          />
        ) : (
          <Card
            sx={{
              width: '98%',
              pt: 2,
              pb: 2,
              pl: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ListItemText primary="Introdução" />

              <Button
                onClick={preview.onTrue}
                sx={{
                  pt: 0,
                  px: 0,
                  mr: 2,
                  cursor: 'default',
                  width: '65px',
                  minWidth: 0,
                }}
              >
                <Chip
                  data-cy="raw-video-preview-intro"
                  size="small"
                  variant="outlined"
                  label="Prévia"
                  sx={{
                    float: 'left',
                    border: 'none',
                    alignContent: 'center',
                    mt: 1,
                    justifyContent: 'center',
                    pt: 0,
                  }}
                  icon={
                    <Iconify
                      icon="tabler:player-play-filled"
                      color="gray"
                      sx={{
                        width: 13,
                        height: 'auto',
                        p: 0,
                      }}
                    />
                  }
                />
              </Button>

              <IconButton
                color="error"
                size="large"
                onClick={() => handleRemoveVideo('introduction')}
                data-cy="intro-clear-button"
                sx={{
                  mr: 2,
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Box>
            <Stack
              component={m.div}
              spacing={2}
              direction="row"
              gap="10px"
              sx={{
                width: '98%',
                pt: 1,
                pb: 1,
                pl: 1,
                borderRadius: 1,
                border: (_theme) => `solid 1px ${alpha(_theme.palette.grey[500], 0.16)}`,
              }}
            >
              <FileThumbnail file="video.mp4" sx={{ mt: 1 }} />

              {/* TODO - Bring video format */}
              <ListItemText
                primary={currentChannel.intro.title}
                secondary={
                  <>
                    <Iconify icon="mdi:label-multiple" sx={{ color: 'gray' }} />
                    {categoryPath(currentChannel.intro.category)}
                  </>
                }
                secondaryTypographyProps={{
                  component: 'span',
                  typography: 'caption',
                }}
              />
            </Stack>
          </Card>
        )}
      </Grid>
    </Grid>
  );

  const renderEndingPicker = (
    <Grid container spacing={3}>
      <VideoPreview
        currentContent={currentChannel?.ending as any}
        open={previewEnding.value}
        onClose={previewEnding.onFalse}
      />

      <Grid xs={12} md={12}>
        {!currentChannel?.ending_id ? (
          <VideoPicker
            title="Adicionar encerramento ao seu canal"
            list={videoData?.results ?? []}
            picked={picked}
            currentChannel={currentChannel}
            setSelected={setSelectedVideos}
            setAddOrRemove={setAddOrRemove}
            currentTab="ending"
            paginationControl={{
              total: videoData?.total,
              currentPage,
              handleChangePage,
              rowsPerPage,
              handleChangeRowsPerPage,
            }}
            isLoading={loading}
          />
        ) : (
          <Card
            sx={{
              width: '98%',
              pt: 2,
              pb: 2,
              pl: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ListItemText primary="Encerramento" />

              <Button
                onClick={preview.onTrue}
                sx={{
                  pt: 0,
                  px: 0,
                  mr: 2,
                  cursor: 'default',
                  width: '65px',
                  minWidth: 0,
                }}
              >
                <Chip
                  data-cy="raw-video-preview-ending"
                  size="small"
                  variant="outlined"
                  label="Prévia"
                  sx={{
                    float: 'left',
                    border: 'none',
                    alignContent: 'center',
                    mt: 1,
                    justifyContent: 'center',
                    pt: 0,
                  }}
                  icon={
                    <Iconify
                      icon="tabler:player-play-filled"
                      color="gray"
                      sx={{
                        width: 13,
                        height: 'auto',
                        p: 0,
                      }}
                    />
                  }
                />
              </Button>

              <IconButton
                color="error"
                size="large"
                onClick={() => handleRemoveVideo('ending')}
                data-cy="intro-clear-button"
                sx={{
                  mr: 2,
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Box>
            <Stack
              component={m.div}
              spacing={2}
              direction="row"
              gap="10px"
              sx={{
                width: '98%',
                pt: 1,
                pb: 1,
                pl: 1,
                borderRadius: 1,
                border: (_theme) => `solid 1px ${alpha(_theme.palette.grey[500], 0.16)}`,
              }}
            >
              {/* TODO - Send File */}
              <FileThumbnail file="video.mp4" sx={{ mt: 1 }} />

              {/* TODO - Bring video format */}
              <ListItemText
                primary={currentChannel?.ending?.title}
                secondary={
                  <>
                    <Iconify icon="mdi:label-multiple" sx={{ color: 'gray' }} />
                    {categoryPath(currentChannel.ending.category)}
                  </>
                }
                secondaryTypographyProps={{
                  component: 'span',
                  typography: 'caption',
                }}
              />
            </Stack>
          </Card>
        )}
      </Grid>
    </Grid>
  );

  const renderActions = (currentTab === 'data' || currentTab === ChannelEditTabs.Group) && (
    <>
      {mdUp && <Grid md={4} />}
      <Stack alignItems="flex-end" sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          data-cy="new-edit-save-final"
        >
          {!currentChannel ? 'Criar Canal' : 'Salvar'}
        </LoadingButton>
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderTabs}
        {currentTab === 'data' && renderDetails}
      </Grid>
      {currentTab === ChannelEditTabs.Group && renderVideoPicker}
      {currentTab === ChannelEditTabs.IntroEnding && (
        <>
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
          <Grid
            container
            spacing={2}
            sx={{
              mt: 2,
            }}
          >
            <Grid item xs={12} md={5.87}>
              {renderIntroPicker}
            </Grid>
            <Grid item xs={12} md={0.25} />
            <Grid item xs={12} md={5.87}>
              {renderEndingPicker}
            </Grid>
          </Grid>
        </>
      )}

      {renderActions}
    </FormProvider>
  );
}
