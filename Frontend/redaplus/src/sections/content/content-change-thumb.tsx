import React from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useSnackbar } from 'src/components/snackbar';

import { isUrl } from '../../utils/url';
import Iconify from '../../components/iconify';
import { fData } from '../../utils/format-number';
import { IContentItem } from '../../types/content';
import axiosInstance, { endpoints } from '../../utils/axios';
import FormProvider, { RHFUploadImage } from '../../components/hook-form';
import { failDeleteText, successDeleteText, successUpdateText } from '../../utils/message';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  mutate: VoidFunction;
  currentContent: IContentItem | IContentItem[] | undefined;
};

export default function ContentChangeThumb({ open, onClose, mutate, currentContent }: Props) {
  const methods = useForm({});

  const { reset, setValue, handleSubmit } = methods;

  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteImage = async (imageId: string | undefined) => {
    try {
      if (!imageId) {
        return;
      }
      await axiosInstance.delete(endpoints.thumb.delete(imageId));
      if (mutate) {
        mutate();
      }
      enqueueSnackbar(successDeleteText('Imagem', false));
    } catch (error) {
      enqueueSnackbar(failDeleteText('Imagem'));
      console.error(error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (
      data.thumb_storage_key &&
      typeof data.thumb_storage_key !== 'string' &&
      'storage_key' in data.thumb_storage_key
    ) {
      data.thumb_storage_key = data.thumb_storage_key.storage_key;
    }
    if (isUrl(data.thumb_storage_key)) {
      delete data.thumb_storage_key;
    }
    delete data.storage_key;

    const contentArray = Array.isArray(currentContent) ? currentContent : [currentContent];
    const promises = contentArray.map((content) =>
      axiosInstance.put(endpoints.video.update(content?.id as string), data)
    );

    await Promise.all(promises);
    reset();
    enqueueSnackbar(successUpdateText('Video', true));
    mutate();
    onClose();
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 2 }}>Alterar miniatura</DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <RHFUploadImage
          setValue={setValue}
          name="thumb_storage_key"
          maxSize={3145728}
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
                {currentContent && (
                  <IconButton
                    data-cy="delete-content-image-button"
                    color="error"
                    onClick={() => {
                      const contentDeleteArray = Array.isArray(currentContent)
                        ? currentContent
                        : [currentContent];
                      for (const content of contentDeleteArray) {
                        handleDeleteImage(content?.thumb?.id);
                      }
                      if (mutate) {
                        mutate();
                      }
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                )}
              </Stack>
            </Box>
          }
        />

        <DialogActions>
          <LoadingButton type="submit" variant="contained" data-cy="upload-image-content-save">
            Salvar
          </LoadingButton>

          <Button
            variant="outlined"
            color="inherit"
            data-cy="upload-image-content-cancel"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
