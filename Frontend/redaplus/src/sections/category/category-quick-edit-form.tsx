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

import { failGenericText, successGenericText } from 'src/utils/message';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { ICategory } from 'src/types/category';

import { CATEGORY_STATUS_OPTIONS } from '../../_mock';
import axiosInstance, { endpoints } from '../../utils/axios';
import CategorySelector from '../../components/category-selector';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentCategory?: ICategory;
  onChange: VoidFunction;
};

export default function CategoryQuickEditForm({ currentCategory, open, onClose, onChange }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().trim().required('Nome é obrigatório'),
    active: Yup.boolean().required('Situação é obrigatório'),
    parent_id: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCategory?.name || '',
      active: currentCategory?.active || false,
      parent_id: currentCategory?.parent_id || null,
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: yupResolver(NewCategorySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    if (currentCategory) {
      setValue('name', currentCategory.name);
      setValue('active', currentCategory.active);
      setValue('parent_id', currentCategory.parent_id);
    }
  }, [setValue, currentCategory]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (typeof data.parent_id !== 'string' && data.parent_id) {
        data.parent_id = (data.parent_id as AnyObject).id;
      }
      if (currentCategory?.id) {
        await axiosInstance.put(endpoints.category.put(currentCategory?.id), data);
        reset();
        onClose();
        onChange();
        enqueueSnackbar(successGenericText());
      }
    } catch (error) {
      enqueueSnackbar(failGenericText(error), { variant: 'error' });
      console.error(error);
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
        <DialogTitle>Edição rápida</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            py={2}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
            }}
          >
            <RHFTextField
              name="name"
              label="Nome da categoria"
              data-cy="category-quick-edit-name"
            />

            <RHFSelect name="active" label="Situação" data-cy="category-quick-edit-status">
              {CATEGORY_STATUS_OPTIONS.map((active) => (
                <MenuItem key={active.label} value={active.value as any} data-cy={active.dataCy}>
                  {active.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <CategorySelector
              label="Agrupar com"
              onChange={(value) => setValue('parent_id', value)}
              value={currentCategory?.parent}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} data-cy="category-quick-edit-cancel-button">
            Cancelar
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            data-cy="category-quick-edit-save-button"
          >
            Salvar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
