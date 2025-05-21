import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
} from 'src/utils/message';

import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { ICategory } from 'src/types/category';

import { CATEGORY_STATUS_OPTIONS } from '../../_mock';
import axiosInstance, { endpoints } from '../../utils/axios';
import CategorySelector from '../../components/category-selector';

// ----------------------------------------------------------------------

type Props = {
  currentCategory?: ICategory;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  const router = useRouter();
  const { id } = useParams();

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().trim().required('Nome é obrigatório'),
    is_primary: Yup.boolean().required('Entidade é obrigatório'),
    active: Yup.boolean().required('Situação é obrigatório'),
    parent_id: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCategory?.name || '',
      active: currentCategory?.active || true,
      is_primary: currentCategory?.is_primary || false,
      parent_id: currentCategory?.parent_id || null,
    }),
    [currentCategory]
  );

  const [isPrimary, setIsPrimary] = useState(defaultValues?.is_primary);

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
      setValue('is_primary', currentCategory.is_primary);
      setValue('parent_id', currentCategory.parent_id);
      setIsPrimary(defaultValues?.is_primary);
    }
  }, [setValue, currentCategory, defaultValues]);

  const handleChangeIsPrimary = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPrimary(event.target.checked);
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.parent_id && 'id' in data.parent_id) {
        data.parent_id = data.parent_id.id;
      }

      data.is_primary = isPrimary;

      if (id) {
        await axiosInstance.put(endpoints.category.put(id as string), data);
      }

      if (!id) {
        await axiosInstance.post(endpoints.category.post, data);
      }

      reset();
      enqueueSnackbar(
        id ? successUpdateText('Categoria', false) : successCreateText('categoria', false)
      );
      router.push(paths.dashboard.category.root);
    } catch (error) {
      enqueueSnackbar(
        id ? failUpdateText('categoria', false) : failCreateText('categoria', false),
        {
          variant: 'error',
        }
      );
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Box>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="name" label="Nome da categoria" data-cy="category-name-new-edit" />

            <RHFSelect name="active" label="Situação" data-cy="category-status-new-edit">
              {CATEGORY_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.label} value={status.value as any} data-cy={status.dataCy}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            sx={{
              mt: user?.is_master ? 0 : 2,
            }}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}
          >
            {user?.is_master && (
              <FormControlLabel
                control={
                  <Switch
                    name="is_primary"
                    checked={isPrimary}
                    onChange={handleChangeIsPrimary}
                    data-cy="category-entity"
                  />
                }
                label="Entidade"
                disabled={Boolean(currentCategory)}
              />
            )}

            {!isPrimary && (
              <CategorySelector
                label="Agrupar com"
                onChange={(value) => setValue('parent_id', value)}
                value={currentCategory?.parent}
                disabled={Boolean(currentCategory)}
              />
            )}
          </Box>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              data-cy="save-button-new-edit"
            >
              {!currentCategory ? 'Criar Categoria' : 'Salvar'}
            </LoadingButton>
          </Stack>
        </Card>
      </Box>
    </FormProvider>
  );
}
