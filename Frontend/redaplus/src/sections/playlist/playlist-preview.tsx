import React from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography/Typography';

import { IPlaylistItem } from '../../types/playlist';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentPlaylist: IPlaylistItem;
};

export default function PlaylistPreview({ currentPlaylist, open, onClose }: Props) {
  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 1100 },
      }}
    >
      <DialogTitle>Prévia da Playlist</DialogTitle>

      <DialogContent>
        <Typography>{currentPlaylist?.name}</Typography>

        <Box
          sx={{
            mt: 1,
            width: 1,
            height: 450,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          <iframe
            width="100%"
            height="100%"
            title={currentPlaylist.name}
            src={currentPlaylist.embed?.embed_url}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button data-cy="video-preview-close-button" variant="outlined" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
