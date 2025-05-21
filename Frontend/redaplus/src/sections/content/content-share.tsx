import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography/Typography';
import { MenuItem, useTheme, TextField } from '@mui/material';

import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { failGenericText } from 'src/utils/message';
import axiosInstance, { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { IContentItem, CONTENT_SHARE_EXPIRATION_TIME_OPTIONS } from 'src/types/content';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentContent: IContentItem;
};

export default function ContentShare({ open, onClose, currentContent }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const baseUrl = `${window.location.origin}`;
  const theme = useTheme();

  const [previewURL, setPreviewURL] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);

  const { copy } = useCopyToClipboard();

  const onCopy = useCallback(
    (text: string) => {
      if (text) {
        copy(text).then(() => enqueueSnackbar('Copiado com sucesso!'));
      }
    },
    [copy, enqueueSnackbar]
  );

  const NewShareContentSchema = Yup.object().shape({
    expirationTime: Yup.string()
      .oneOf(
        CONTENT_SHARE_EXPIRATION_TIME_OPTIONS.map((type) => type.value),
        'Valor inválido'
      )
      .required('Tempo de expiração é obrigatório'),
    videoPassword: Yup.string().required('Senha é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      expirationTime: '6',
      videoPassword: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewShareContentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.post(endpoints.video.sharePreview, {
        video_id: currentContent.id,
        expirationTime: data.expirationTime,
        videoPassword: data.videoPassword,
      });

      setPreviewURL(
        `${baseUrl}/auth/jwt/insert-password/?video_id=${currentContent.id}&expirationTime=${data.expirationTime}`
      );
      setIsLinkGenerated(true);
      enqueueSnackbar('URL criado com sucesso');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(failGenericText(), { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

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
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 1 }}>Compartilhamento de conteúdo</DialogTitle>

        <DialogContent>
          <Box sx={{ pb: 3 }}>
            <Typography sx={{ pb: 3 }}>{currentContent.title}</Typography>

            <RHFSelect
              name="expirationTime"
              label="Duração da url"
              data-cy="new-content-share-select"
            >
              {CONTENT_SHARE_EXPIRATION_TIME_OPTIONS.map((type) => (
                <MenuItem key={type.label} value={type.value} data-cy={type.dataCy}>
                  {type.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField
              name="videoPassword"
              label="Senha"
              data-cy="new-content-share-password"
              sx={{
                mt: 2,
              }}
            />
          </Box>

          {previewURL && (
            <TextField
              data-cy="content-url-selected"
              disabled
              fullWidth
              label="Url da prévia"
              multiline
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
                      <IconButton
                        onClick={() => {
                          onCopy(previewURL);
                          setCopied(true);
                        }}
                      >
                        <Iconify
                          icon={copied ? 'eva:checkmark-circle-2-fill' : 'eva:copy-fill'}
                          width={24}
                          color={copied ? 'green !important' : 'inherit'}
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              value={previewURL}
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
          )}
        </DialogContent>

        <DialogActions>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            data-cy="content-save"
            disabled={isLinkGenerated}
          >
            Criar link
          </LoadingButton>
          <Button data-cy="content-cancel" variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
