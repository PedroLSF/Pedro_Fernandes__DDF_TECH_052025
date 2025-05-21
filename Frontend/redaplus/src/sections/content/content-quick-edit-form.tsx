import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import { MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { IContentItem, CONTENT_STATUS_OPTIONS } from 'src/types/content';

import axiosInstance, { endpoints } from '../../utils/axios';
import { failGenericText, successGenericText } from '../../utils/message';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentContent: IContentItem;
  onChange: VoidFunction;
};

export default function ContentQuickEditForm({ currentContent, open, onClose, onChange }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Titulo é obrigatório'),
    active: Yup.boolean().required('Situação é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentContent?.title || '',
      active: currentContent?.active || false,
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
      setValue('title', currentContent.title);
      setValue('active', currentContent.active);
    }
  }, [setValue, currentContent]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.put(endpoints.video.update(currentContent.id), data);
      onClose();
      onChange();
      enqueueSnackbar(successGenericText());
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
        <DialogTitle>Edição Rápida</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
            sx={{ pt: 3, pb: 3 }}
          >
            <RHFTextField name="title" label="Titulo *" data-cy="content-title" />

            <RHFSelect name="active" label="Situação *" data-cy="content-quick-edit-status">
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
