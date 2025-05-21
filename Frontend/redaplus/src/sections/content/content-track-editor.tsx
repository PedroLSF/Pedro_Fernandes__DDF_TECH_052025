import { useForm, FormProvider } from 'react-hook-form';
import React, { useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/system';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useDebounce } from 'src/hooks/use-debounce';

import axios, { endpoints } from 'src/utils/axios';

import { RHFTextField } from 'src/components/hook-form';
import { LoadingScreen } from 'src/components/loading-screen';

import { IVideoTrack, IContentItem } from 'src/types/content';

type Props = {
  open: boolean;
  track: IVideoTrack;
  content: string;
  onSave: (track: IVideoTrack, updatedContent: string, updatedTitle: string) => void;
  onClose: () => void;
  item?: IContentItem;
};

export default function ContentTrackEditor({ track, content, onSave, open, onClose, item }: Props) {
  const [editedContent, setEditedContent] = useState(content);
  const [titleContent, setTitleContent] = useState(track.label);
  const [subtitlesBlobUrl, setSubtitlesBlobUrl] = useState<string | null>(null);

  const srtToVtt = (srt: string): string => {
    const lines = srt.split(/\r?\n/);
    const timeCodeRegex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
    const numberRegex = /^\d+$/;
    const eol = '\n';
    return lines.reduce((acc, line) => {
      if (line.match(timeCodeRegex)) {
        const value = line.replace(/,/g, '.');
        return `${acc}${value}${eol}`;
      }
      if (line.match(numberRegex)) {
        return acc;
      }
      if (line === '') {
        return `${acc}${eol}`;
      }
      return `${acc}${line}${eol}`;
    }, `WEBVTT${eol}`);
  };

  const createVttBlob = (contentTrack: string) => {
    const blob = new Blob([contentTrack], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  };

  const debouncedContent = useDebounce(editedContent, 1500);

  useEffect(() => {
    if (subtitlesBlobUrl) {
      URL.revokeObjectURL(subtitlesBlobUrl);
    }

    const vttContent = srtToVtt(debouncedContent);
    const blobUrl = createVttBlob(vttContent);
    setSubtitlesBlobUrl(blobUrl);

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent]);

  const methods = useForm({
    defaultValues: {
      trackName: titleContent,
    },
  });

  const handleSave = () => {
    onSave(track, editedContent, titleContent);
  };

  const [previewUri, setPreviewUri] = useState<string | null>(null);

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
    if (!item) {
      return;
    }

    if (!item?.id || !open) {
      return;
    }
    getVideoPreviewUri(item?.id as string).then((uri) => {
      setPreviewUri(uri);
    });
  }, [getVideoPreviewUri, open, item]);

  return (
    <FormProvider {...methods}>
      <Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            height: 'calc(100vh - 14px)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle> Editar Legenda: </DialogTitle>

        <Box
          sx={{
            px: 1,
          }}
        >
          <RHFTextField
            name="trackName"
            label="Título da Legenda"
            value={titleContent}
            onChange={(e) => setTitleContent(e.target.value)}
          />
        </Box>

        <DialogContent sx={{ p: 2, overflow: 'hidden' }}>
          {item && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                minWidth: 0,
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1, minWidth: '300px' }}>
                {
                  /* eslint-disable jsx-a11y/media-has-caption */

                  previewUri ? (
                    <video
                      id="video-preview"
                      style={{ width: '100%', height: '100%' }}
                      src={previewUri}
                      controls
                      autoPlay
                      loop
                    >
                      <track
                        kind="subtitles"
                        src={subtitlesBlobUrl || ''}
                        label="Português"
                        default
                      />
                    </video>
                  ) : (
                    <LoadingScreen />
                  )
                  /* eslint-enable jsx-a11y/media-has-caption */
                }
              </Box>

              <Box sx={{ flex: 2 }}>
                <textarea
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'inherit',
                    color: 'inherit',
                    borderRadius: '8px',
                    padding: '8px',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    resize: 'none',
                  }}
                  value={editedContent}
                  rows={25}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              // Do not Remove, this is a free() memory
              if (subtitlesBlobUrl) {
                URL.revokeObjectURL(subtitlesBlobUrl);
              }
              onClose();
            }}
            data-cy="cancel-edit-track"
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              // Do not Remove, this is a free() memory
              if (subtitlesBlobUrl) {
                URL.revokeObjectURL(subtitlesBlobUrl);
              }
              handleSave();
            }}
          >
            {track.approved_by ? 'Salvar' : 'Aprovar e Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
