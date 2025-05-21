import React, { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useSnackbar } from 'src/components/snackbar';

import { IChannel } from '../../types/channel';
import { IPlaylistItem } from '../../types/playlist';
import axiosInstance, { endpoints } from '../../utils/axios';
import ChannelSelector from '../../components/channel-selector';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentPlaylist: IPlaylistItem;
};

export default function PlaylistCopyDialog({ currentPlaylist, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [channel, setChannel] = useState<IChannel | null>();
  const [isLoading, setIsLoading] = useState(false);

  const isCopyDisabled = !channel || channel?.id === currentPlaylist.channel_id;

  const handleCopy = async () => {
    if (!channel) return;

    try {
      setIsLoading(true);

      const data = {
        channel_id: channel.id,
        playlist_name: currentPlaylist.name,
      };
      await axiosInstance.post(endpoints.playlist.copy(currentPlaylist.id), data);

      enqueueSnackbar('Playlist copiada com sucesso');
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>Copiar playlist</DialogTitle>

      <DialogContent>
        <Typography sx={{ pb: 1 }}>
          Selecione o canal para o qual deseja copiar a playlist
        </Typography>

        <ChannelSelector
          label="Canal *"
          onChange={(value) => setChannel(value ? value[0] : null)}
        />

        {channel && channel.id === currentPlaylist.channel_id && (
          <Typography sx={{ pt: 2, color: 'error.main' }} variant="subtitle2">
            *Não é possível copiar a playlist para o próprio canal.
          </Typography>
        )}

        {channel && channel.id !== currentPlaylist.channel_id && (
          <Typography sx={{ pt: 2 }} variant="subtitle2">
            Se os vídeos desta playlist não estiverem associados ao canal de destino, eles serão
            associados automaticamente ao copiá-la.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose} data-cy="cancel-copy-playlist">
          Cancelar
        </Button>

        <LoadingButton
          onClick={handleCopy}
          disabled={isCopyDisabled || isLoading}
          variant="contained"
          data-cy="copy-playlist"
        >
          Copiar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
