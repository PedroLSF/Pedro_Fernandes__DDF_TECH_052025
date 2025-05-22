import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import axiosInstance, { endpoints } from 'src/utils/axios';
import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
} from 'src/utils/message';

import { AuthUserType } from 'src/auth/types';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { IEssayItem, EssayStatusType } from 'src/types/essay';

// ----------------------------------------------------------------------

type Props = {
  user?: AuthUserType;
  currentEssay?: IEssayItem;
  mutate?: VoidFunction;
};

export default function EssayNewEditForm({ user, currentEssay, mutate }: Props) {
  const router = useRouter();
  const { id } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Titulo é obrigatório'),
    theme: Yup.string().required('Tema é obrigatório'),
    text: Yup.string().required('Texto é obrigatório'),
    note: Yup.number().nullable(),
    user_id: Yup.string().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentEssay?.title || '',
      theme: currentEssay?.theme || '',
      text: currentEssay?.text || '',
      note: currentEssay?.note || null,
      user_id: currentEssay?.user_id,
    }),
    [currentEssay]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (id) {
        await axiosInstance.put(endpoints.essay.update(id as string), {
          ...data,
          user_id: user?.id,
          status: data.note == null ? EssayStatusType.Submitted : EssayStatusType.Reviewed,
        });
      }

      if (!id) {
        await axiosInstance.post(endpoints.essay.post, {
          ...data,
          user_id: user?.id,
          status: data.note == null ? EssayStatusType.Submitted : EssayStatusType.Reviewed,
        });
      }

      reset();
      enqueueSnackbar(id ? successUpdateText('Redação', true) : successCreateText('redação', true));
      if (mutate) {
        mutate();
      }
      router.push(paths.dashboard.essay.root);
    } catch (error) {
      enqueueSnackbar(id ? failUpdateText('redação', true) : failCreateText('redação', true), {
        variant: 'error',
      });
      if (error.message) {
        enqueueSnackbar(error.message, {
          variant: 'error',
        });
      }
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField
                name="title"
                label="Titulo da Redação *"
                data-cy="title-name"
                disabled={currentEssay && currentEssay.status === EssayStatusType.Reviewed}
              />
              <RHFTextField
                name="theme"
                label="Tema da Redação *"
                data-cy="theme-name"
                disabled={
                  Boolean(currentEssay) ||
                  (currentEssay && currentEssay.status === EssayStatusType.Reviewed)
                }
              />

              <RHFTextField
                name="text"
                label="Redação"
                data-cy="user-essay"
                multiline
                minRows={15}
                fullWidth
                disabled={currentEssay && currentEssay.status === EssayStatusType.Reviewed}
              />

              {user && user.is_master ? (
                <RHFTextField name="note" label="Nota" data-cy="user-phone" />
              ) : (
                <Typography variant="h3" sx={{ mt: 1, color: 'text.disabled', textAlign: 'left' }}>
                  Nota:{' '}
                  {currentEssay?.note && currentEssay?.note !== null ? currentEssay.note : '-'}
                </Typography>
              )}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                data-cy="user-save"
              >
                {!currentEssay ? 'Criar Redação' : 'Salvar'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
