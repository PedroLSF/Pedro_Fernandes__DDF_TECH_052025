import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography/Typography';

import { SeverErrorIllustration } from 'src/assets/illustrations';

import { IVideo } from '../../types/video';
import { IContentItem } from '../../types/content';
import { removeExtension } from '../../utils/video';
import axios, { endpoints } from '../../utils/axios';
import { LoadingScreen } from '../../components/loading-screen';
// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentContent?: IContentItem | IVideo;
  videoLink?: string;
};

export default function VideoPreview({ currentContent, open, onClose, videoLink }: Props) {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const getVideoPreviewUri = useCallback(async (video_id: string) => {
    const response = await axios.post(endpoints.video.requestPreview, {
      video_id,
    });
    const {
      data: { preview_uri },
    } = response;
    if (!preview_uri) {
      return null;
    }
    return preview_uri;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentContent?.id || !open) {
      return;
    }
    getVideoPreviewUri(currentContent?.id as string).then((uri) => {
      setPreviewUri(uri);
    });
  }, [getVideoPreviewUri, currentContent?.id, open]);

  useEffect(() => {
    if (videoLink) {
      setPreviewUri(videoLink);
    }
  }, [videoLink]);

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
      <DialogTitle>Prévia do Vídeo</DialogTitle>

      <DialogContent>
        <Typography>{removeExtension(currentContent?.title)}</Typography>

        <Box
          sx={{
            mt: 1,
            width: 1,
            height: 320,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {error ? (
            <SeverErrorIllustration
              sx={{
                height: 160,
                my: { xs: 5, sm: 10 },
              }}
            />
          ) : (
            <>
              {
                /* eslint-disable jsx-a11y/media-has-caption */
                previewUri ? (
                  <video
                    id="video-preview"
                    style={{ width: '100%', height: '100%' }}
                    src={videoLink ?? previewUri}
                    controls
                    autoPlay
                    loop
                    onError={() => setError(true)}
                  />
                ) : (
                  <LoadingScreen />
                )

                /* eslint-enable jsx-a11y/media-has-caption */
              }
            </>
          )}
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
