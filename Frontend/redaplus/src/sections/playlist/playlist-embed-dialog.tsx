import { useSnackbar } from 'notistack';
import React, { useState, useCallback } from 'react';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Dialog,
  useTheme,
  Accordion,
  TextField,
  Typography,
  DialogContent,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import Iconify from 'src/components/iconify';

import { IPlaylistItem } from '../../types/playlist';
import { CopiedState, useCopyToClipboard } from '../../hooks/use-copy-to-clipboard';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentPlaylist?: IPlaylistItem;
};

export default function PlaylistEmbedDialog({ currentPlaylist, open, onClose }: Props) {
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState<string | false>(false);
  const theme = useTheme();

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

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

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720, p: 2, backgroundColor: 'background.default' },
      }}
    >
      <DialogContent>
        <Typography variant="subtitle1" py={2}>
          Lista de Embeds disponíveis:
        </Typography>
        {currentPlaylist?.embed && (
          <Accordion
            data-cy={`content-embed-${currentPlaylist?.embed?.embed_url}`}
            key={currentPlaylist?.embed?.embed_url}
            sx={{ width: '100%', backgroundColor: 'background.paper' }}
            expanded={expanded === currentPlaylist?.embed?.embed_url}
            onChange={handleChange(currentPlaylist?.embed?.embed_url)}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id={currentPlaylist?.embed?.embed_url}
              expandIcon={<Iconify icon="ic:round-expand-more" />}
            >
              {currentPlaylist?.embed?.title}
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                data-cy="content-embed-selected"
                disabled
                fullWidth
                label="Embed"
                multiline
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          copiedState[currentPlaylist?.embed.embed_url]?.embed
                            ? 'Copiado'
                            : 'Copiar'
                        }
                      >
                        <IconButton
                          onClick={() =>
                            onCopy(
                              `<iframe src="${currentPlaylist?.embed?.embed_url}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
                              currentPlaylist?.embed?.embed_url ?? '',
                              'embed'
                            )
                          }
                        >
                          <Iconify
                            icon={
                              copiedState[currentPlaylist?.embed?.embed_url]?.embed
                                ? 'eva:checkmark-circle-2-fill'
                                : 'eva:copy-fill'
                            }
                            width={24}
                            color={
                              copiedState[currentPlaylist?.embed?.embed_url]?.embed
                                ? 'green !important'
                                : 'inherit'
                            }
                          />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                value={`<iframe src="${currentPlaylist?.embed?.embed_url}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`}
                // Deixa o campo de determinada cor dependendo do theme
                sx={{
                  '& .MuiInputBase-root.Mui-disabled': {
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                }}
              />
            </AccordionDetails>
            <AccordionDetails>
              <TextField
                data-cy="content-url-selected"
                disabled
                fullWidth
                label="Url da mídia"
                multiline
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          copiedState[currentPlaylist?.embed?.embed_url]?.mediaUrl
                            ? 'Copiado'
                            : 'Copiar'
                        }
                      >
                        <IconButton
                          onClick={() =>
                            onCopy(
                              currentPlaylist?.embed?.embed_url ?? '',
                              currentPlaylist?.embed?.embed_url ?? '',
                              'mediaUrl'
                            )
                          }
                        >
                          <Iconify
                            icon={
                              copiedState[currentPlaylist?.embed?.embed_url]?.mediaUrl
                                ? 'eva:checkmark-circle-2-fill'
                                : 'eva:copy-fill'
                            }
                            width={24}
                            color={
                              copiedState[currentPlaylist?.embed?.embed_url]?.mediaUrl
                                ? 'green !important'
                                : 'inherit'
                            }
                          />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                value={currentPlaylist?.embed?.embed_url}
                // Deixa o campo de determinada cor dependendo do theme
                sx={{
                  '& .MuiInputBase-root.Mui-disabled': {
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  },
                }}
              />
            </AccordionDetails>
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  );
}
