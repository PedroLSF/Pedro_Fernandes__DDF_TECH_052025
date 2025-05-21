import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { failGenericText, successGenericText } from 'src/utils/message';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { ITagItem, TAG_STATUS_OPTIONS, TAG_COLOR_NAME_OPTIONS } from 'src/types/tag';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentTag?: ITagItem;
  mutate: VoidFunction;
};

export default function TagQuickEditForm({ currentTag, open, onClose, mutate }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewTagSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    color: Yup.string().required('Cor é obrigatório'),
    active: Yup.boolean().required('Situação é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentTag?.name || '',
      color: currentTag?.color || '',
      active: currentTag?.active || false,
    }),
    [currentTag]
  );

  const methods = useForm({
    resolver: yupResolver(NewTagSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    if (currentTag) {
      setValue('name', currentTag.name);
      setValue('color', currentTag.color);
      setValue('active', currentTag.active);
    }
  }, [setValue, currentTag]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.put(`${endpoints.tag}/${currentTag?.id}`, data);
      console.info('DATA', data);
      reset();
      onClose();
      enqueueSnackbar(successGenericText());
      console.info('DATA TAG', data);
      await mutate();
    } catch (error) {
      enqueueSnackbar(failGenericText(), { variant: 'error' });
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
            py={2}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField
              name="name"
              label="Nome da Tag"
              data-cy="tag-name"
              disabled={Boolean(currentTag)}
            />

            <RHFSelect name="color" label="Cor" data-cy="tag-color">
              {TAG_COLOR_NAME_OPTIONS.map((color) => (
                <MenuItem key={color.label} value={color.value} data-cy={color.dataCy}>
                  {color.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="active" label="Situação" data-cy="tag-active">
              {TAG_STATUS_OPTIONS.map((active) => (
                <MenuItem key={active.label} value={active.value as any} data-cy={active.dataCy}>
                  {active.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} data-cy="tag-cancel">
            Cancelar
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            data-cy="tag-save"
          >
            Salvar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
