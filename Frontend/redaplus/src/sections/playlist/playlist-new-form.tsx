import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem/MenuItem';

import { useParams, useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { ITagItem } from '../../types/tag';
import { paths } from '../../routes/paths';
import useFetch from '../../hooks/useFetch';
import ChannelSelector from '../../components/channel-selector';
import axiosInstance, { fetcher, endpoints } from '../../utils/axios';
import { IPlaylistItem, PLAYLIST_STATUS_OPTIONS } from '../../types/playlist';
import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
} from '../../utils/message';

type Props = {
  currentPlaylist?: IPlaylistItem;
};

export default function PlaylistNewForm({ currentPlaylist }: Props) {
  const router = useRouter();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const NewPlaylistSchema = Yup.object().shape({
    name: Yup.string().required('Nome da playlist é obrigatório'),
    tags_ids: Yup.array().optional(),
    channel_id: Yup.string().optional(),
    active: Yup.boolean().required('Situação é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPlaylist?.name || '',
      tags_ids: currentPlaylist?.tagPlaylist?.map((tagPlaylist) => tagPlaylist?.tag) || [],
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
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [tagPlaylist, setTagPlaylist] = useState(defaultValues.tags_ids);
  const [channelData, setChannelData] = useState(null);
  const [channel, setChannel] = useState<string[]>([]);

  const { data: tagData } = useFetch<{ results: Array<ITagItem> }>(endpoints.tag, {
    params: {
      take: 10,
      skip: 0,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.channel_id = channel[0];
      data.tags_ids = tagPlaylist.map((tag) => tag.id);

      const response = await axiosInstance.post(endpoints.playlist.post, data);

      reset();
      enqueueSnackbar(
        id ? successUpdateText('Playlist', false) : successCreateText('Playlist', false)
      );

      router.push(paths.dashboard.playlist.edit(response.data.id));
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

  const fetchChannelData = useCallback(async () => {
    const data = await fetcher([endpoints.channel.get(id as string), {}]);
    setChannelData(data);
    setChannel([data.id]);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchChannelData();
    }
  }, [id, fetchChannelData]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card>
        <Stack spacing={3} sx={{ p: 3 }}>
          <ChannelSelector
            label="Canal *"
            value={channelData}
            onChange={(value) => setChannel(value ? value.map((ch) => ch.id) : [])}
          />

          <RHFTextField name="name" label="Nome da playlist *" data-cy="playlist-name-new-edit" />

          <RHFAutocomplete
            name="tags_ids"
            label="Tags"
            placeholder="Escolha suas tags"
            data-cy="new-edit-tag-options"
            multiple
            value={tagPlaylist}
            onChange={(event: React.SyntheticEvent, value: any[]) => {
              setTagPlaylist(value);
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

          <RHFSelect name="active" label="Situação" data-cy="new-edit-status">
            {PLAYLIST_STATUS_OPTIONS.map((status) => (
              <MenuItem key={status.label} value={status.value as any} data-cy={status.dataCy}>
                {status.label}
              </MenuItem>
            ))}
          </RHFSelect>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              disabled={channel.length <= 0}
              type="submit"
              variant="contained"
              loading={isSubmitting}
              data-cy="user-save"
            >
              Criar Playlist
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </FormProvider>
  );
}
