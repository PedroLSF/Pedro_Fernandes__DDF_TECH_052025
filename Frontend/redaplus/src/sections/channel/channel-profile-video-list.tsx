import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { IVideo } from 'src/types/video';

import VideoPreview from '../raw-content/video-preview';
import ChannelProfileVideo from './channel-profile-video';
// ----------------------------------------------------------------------

interface Props {
  data: IVideo[];
  thumb: string | null;
  onChange: VoidFunction;
  hideThumb: boolean;
}

export default function ChannelProfileVideoList({ data, thumb, onChange, hideThumb }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [videoPreview, setVideoPreview] = useState<IVideo | null>(null);
  const { id: channelId } = useParams();
  const currentChannelId = typeof channelId === 'string' ? channelId : channelId?.[0] || '';
  const preview = useBoolean();

  const confirm = useBoolean();

  const isVideoInChannelPlaylist = (video: IVideo) => {
    if (!video.videoPlaylist || video.videoPlaylist.length === 0) {
      return false;
    }

    return video.videoPlaylist.some((playlistItem) => {
      if (playlistItem && playlistItem.playlist) {
        const { playlist } = playlistItem;
        return playlist && playlist.channel_id === currentChannelId;
      }
      return false;
    });
  };

  const handleView = (video: IVideo) => {
    setVideoPreview(video);
    preview.onTrue();
  };

  const handleSelected = (videoId: string) => {
    setSelected((prevSelected) => {
      const newSelected = new Set(prevSelected);
      newSelected.add(videoId);
      return newSelected;
    });
  };

  const handleUnselected = (videoId: string) => {
    setSelected((prevSelected) => {
      const newSelected = new Set(prevSelected);
      newSelected.delete(videoId);
      return newSelected;
    });
  };

  const handleDelete = async () => {
    try {
      const videosToRemove = Array.from(selected).filter(
        (videoId) => !isVideoInChannelPlaylist(data.find((video) => video.id === videoId)!)
      );

      if (videosToRemove.length === 0) {
        enqueueSnackbar('Não é possível remover vídeos que estão em playlists deste canal', {
          variant: 'warning',
        });
        confirm.onFalse();
        return;
      }

      const promises = videosToRemove.map((videoId) =>
        axiosInstance.put(endpoints.channel.removeVideoFromChannel, {
          channel_id: currentChannelId,
          video_id: videoId,
        })
      );
      await Promise.all(promises);
      enqueueSnackbar('Vídeo(s) removido(s) com sucesso', { variant: 'success' });
      onChange();
      setSelected(new Set());
    } catch (error) {
      enqueueSnackbar('Error ao remover Vídeo(s)', { variant: 'error' });
    } finally {
      confirm.onFalse();
    }
  };

  const handleOnDelete = (videoId: string) => {
    const video = data.find((v) => v.id === videoId);
    if (video && isVideoInChannelPlaylist(video)) {
      enqueueSnackbar('Não é possível remover vídeos que estão em playlists deste canal', {
        variant: 'warning',
      });
      return;
    }

    setSelected(new Set([videoId]));
    confirm.onTrue();
  };

  return (
    <>
      {selected.size > 0 && (
        <Card sx={{ p: 2, my: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body1" mx={1}>
              Foram selecionados {selected.size} vídeos
            </Typography>
            <Tooltip title="Remover Todos">
              <IconButton
                sx={{ borderRadius: 1 }}
                onClick={confirm.onTrue}
                data-cy="video-channel-remove-selected-video"
              >
                <Iconify icon="solar:close-circle-bold" color="error.dark" width={20} />
                <Typography variant="body1" mx={1} color="error.dark">
                  Remover todos os vídeos selecionados do canal
                </Typography>
              </IconButton>
            </Tooltip>
          </Stack>
        </Card>
      )}
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: `repeat(${hideThumb ? '5' : '4'}, 1fr)`,
        }}
      >
        {data?.map((item: IVideo) => (
          <ChannelProfileVideo
            key={item.id}
            video={item}
            thumb={thumb || ''}
            onView={() => handleView(item)}
            onDelete={() => handleOnDelete(item.id)}
            onSelected={() => handleSelected(item.id)}
            onUnselected={() => handleUnselected(item.id)}
            hideThumb={hideThumb}
            disableRemove={isVideoInChannelPlaylist(item)}
          />
        ))}
      </Box>

      {videoPreview && (
        <VideoPreview
          currentContent={videoPreview}
          open={preview.value}
          onClose={preview.onFalse}
        />
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setSelected(new Set());
          confirm.onFalse();
        }}
        title="Excluir"
        content="Tem certeza que deseja remover o(s) video(s) do canal?"
        action={
          <Button variant="contained" data-cy="delete-button" color="error" onClick={handleDelete}>
            Remover
          </Button>
        }
        data-cy="video-channel-remove-video"
      />
    </>
  );
}
