import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';

import { useParams } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';
import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
} from 'src/utils/message';

import { AuthUserType } from 'src/auth/types';

import { useSnackbar } from 'src/components/snackbar';

import { IPlanningItem } from 'src/types/planning';

type Props = {
  user?: AuthUserType;
  currentPlanning?: IPlanningItem;
  mutate?: VoidFunction;
};

export default function PlanningNewEditForm({ user, currentPlanning, mutate }: Props) {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [planningText, setPlanningText] = useState<string>('');
  const NewUserSchema = Yup.object().shape({
    title: Yup.string().required('Titulo é obrigatório'),
    theme: Yup.string().required('Tema é obrigatório'),
    user_id: Yup.string().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentPlanning?.title || '',
      theme: currentPlanning?.theme || '',
      user_id: currentPlanning?.user_id || null,
    }),
    [currentPlanning]
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const handleGeneratePlanning = useCallback(
    async (data: any) => {
      try {
        const accessToken = localStorage.getItem('@@access_token');
        if (!accessToken) throw new Error('Token de acesso não encontrado no localStorage.');

        const payload = {
          titulo: data.title,
          tema: data.theme,
          user_id: user?.id,
          gpt_api_key: process.env.NEXT_PUBLIC_IA_KEY,
          access_token: accessToken,
        };

        const res = await axiosInstance.post(
          'http://localhost:5678/webhook/a855de28-5c4e-4b1a-8e07-7f82d22a4fed',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const responseText = res.data?.[0]?.text || '';

        setPlanningText(responseText);

        enqueueSnackbar(
          id ? successUpdateText('Planejamento', true) : successCreateText('planejamento', true)
        );
      } catch (error: any) {
        enqueueSnackbar(
          id ? failUpdateText('planejamento', true) : failCreateText('planejamento', true),
          { variant: 'error' }
        );
        if (error.message) {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      }
    },
    [enqueueSnackbar, id, user?.id]
  );

  return (
    <>
      <form onSubmit={handleSubmit(handleGeneratePlanning)}>
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
                <TextField
                  label="Titulo do Planejamento *"
                  data-cy="user-planning"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  {...register('title')}
                />

                <TextField
                  label="Tema do Planejamento *"
                  data-cy="user-theme"
                  fullWidth
                  error={!!errors.theme}
                  helperText={errors.theme?.message}
                  {...register('theme')}
                />
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  data-cy="user-save"
                >
                  {!currentPlanning ? 'Criar Planejamento' : 'Salvar'}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </form>

      {planningText && (
        <Card sx={{ mt: 3, p: 3, whiteSpace: 'pre-wrap' }}>
          <h3>Planejamento gerado:</h3>
          <div>{planningText}</div>
        </Card>
      )}
    </>
  );
}
