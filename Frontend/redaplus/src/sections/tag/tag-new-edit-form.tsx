import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import axiosInstance, { endpoints } from 'src/utils/axios';
import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
  failEntityExistsText,
} from 'src/utils/message';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { ITagItem, TAG_STATUS_OPTIONS, TAG_COLOR_NAME_OPTIONS } from 'src/types/tag';

// ----------------------------------------------------------------------

type Props = {
  currentTag?: ITagItem;
};

export default function TagNewEditForm({ currentTag }: Props) {
  const router = useRouter();
  const { id } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const NewTagSchema = Yup.object().shape({
    name: Yup.string().required('Nome da tag é obrigatório'),
    color: Yup.string().required('Cor da tag é obrigatório'),
    active: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentTag?.name || '',
      color: currentTag?.color || '',
      active: currentTag?.active || true,
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
      if (id) {
        await axiosInstance.put(`${endpoints.tag}/${id}`, data);
      }
      if (!id) {
        await axiosInstance.post(`${endpoints.tag}`, data);
      }
      reset();
      enqueueSnackbar(id ? successUpdateText('Tag', false) : successCreateText('tag', false));
      router.push(paths.dashboard.tag.list);
    } catch (error) {
      if (error.message) {
        enqueueSnackbar(failEntityExistsText('Tag'), { variant: 'error' });
        return;
      }
      enqueueSnackbar(id ? failUpdateText('tag', false) : failCreateText('tag', false), {
        variant: 'error',
      });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={0}>
        <Grid xs={12} md>
          <Card sx={{ p: 4 }}>
            <Box rowGap={3} columnGap={2} display="flex">
              <RHFTextField
                name="name"
                label="Nome da Tag"
                disabled={Boolean(currentTag)}
                value={currentTag?.name}
                data-cy="tag-name"
              />
              <RHFSelect
                name="color"
                label="Cor da Tag"
                defaultValue={currentTag?.color}
                data-cy="tag-color"
              >
                {TAG_COLOR_NAME_OPTIONS.map((color) => (
                  <MenuItem key={color.label} value={color.value} data-cy={color.dataCy}>
                    {color.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect
                name="active"
                label="Situação"
                defaultValue={currentTag?.active}
                data-cy="tag-active"
              >
                {TAG_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.label} value={status.value as any} data-cy={status.dataCy}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                data-cy="tag-save"
              >
                {!currentTag ? 'Criar Tag' : 'Salvar'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
