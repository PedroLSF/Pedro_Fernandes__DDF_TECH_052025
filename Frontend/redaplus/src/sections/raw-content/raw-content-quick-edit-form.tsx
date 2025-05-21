import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useSearchParams } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { IVideo } from 'src/types/video';
import { IArchive } from 'src/types/archive';

import { ICategory } from '../../types/category';
import { removeExtension } from '../../utils/video';
import axiosInstance, { endpoints } from '../../utils/axios';
import CategorySelector from '../../components/category-selector';
import { failGenericText, successGenericText } from '../../utils/message';
import { IContentItem, CONTENT_STATUS_OPTIONS } from '../../types/content';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentContent: IContentItem | IVideo | IArchive;
  onChange?: VoidFunction | (() => any) | undefined;
};

export default function RawContentQuickEditForm({
  currentContent,
  open,
  onClose,
  onChange,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [videoCategory, setVideoCategory] = useState<ICategory | null | undefined>(
    currentContent?.category
  );

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Titulo é obrigatório'),
    active: Yup.boolean(),
    category_id: Yup.string().optional().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentContent?.title || '',
      active: currentContent?.active || false,
      category_id: currentContent?.category?.id || null || undefined,
    }),
    [currentContent]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    if (currentContent) {
      setValue('title', removeExtension(currentContent.title));
      setValue('active', currentContent.active);
    }
  }, [setValue, currentContent]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.category_id = null;
      if (videoCategory) {
        data.category_id = videoCategory.id;
      }

      if (currentContent.id.startsWith('fle_')) {
        await axiosInstance.put(endpoints.file.update(currentContent.id), data);
      } else {
        await axiosInstance.put(endpoints.video.update(currentContent.id), data);
      }
      onClose();
      if (typeof onChange === 'function') {
        onChange();
      }
      enqueueSnackbar(successGenericText());
    } catch (error) {
      console.error(error);
      enqueueSnackbar(failGenericText(), { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  const urlParams = useSearchParams();

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
        <DialogTitle>Edição Rápida</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
            }}
            sx={{ pt: 3, pb: 3 }}
          >
            <RHFTextField name="title" label="Titulo" data-cy="content-title" />
            <RHFSelect name="active" label="Situação" data-cy="content-quick-status">
              {CONTENT_STATUS_OPTIONS.map((status) => (
                <MenuItem
                  data-cy={`content-edit-active-${status?.dataCy}`}
                  key={status.label}
                  value={status.value as any}
                >
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <CategorySelector
              label="Diretório"
              value={currentContent.category}
              onChange={(value) => setVideoCategory(value as ICategory)}
              directories={urlParams.has('directories')}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            data-cy="content-save"
          >
            Salvar
          </LoadingButton>
          <Button data-cy="content-cancel" variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
