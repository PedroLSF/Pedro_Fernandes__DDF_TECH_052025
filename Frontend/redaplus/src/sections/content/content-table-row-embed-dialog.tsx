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

import { IContentItem } from 'src/types/content';

import { CopiedState, useCopyToClipboard } from '../../hooks/use-copy-to-clipboard';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentContent?: IContentItem;
};

export default function ContentTableRowEmbedDialog({ currentContent, open, onClose }: Props) {
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
        {currentContent?.embeds &&
          currentContent?.embeds?.map((embed) => (
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
                  data-cy="content-embed-selected"
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
                          title={copiedState[embed.embed_url]?.mediaUrl ? 'Copiado' : 'Copiar'}
                        >
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
                                copiedState[embed.embed_url]?.mediaUrl
                                  ? 'green !important'
                                  : 'inherit'
                              }
                            />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  value={embed.embed_url}
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
          ))}
      </DialogContent>
    </Dialog>
  );
}
