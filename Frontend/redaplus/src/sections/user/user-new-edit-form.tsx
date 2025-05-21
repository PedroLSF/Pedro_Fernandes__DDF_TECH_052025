import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';
import axiosInstance, { endpoints } from 'src/utils/axios';
import {
  failCreateText,
  failUpdateText,
  successCreateText,
  successUpdateText,
} from 'src/utils/message';

import { useAuthContext } from 'src/auth/hooks';

import { useSnackbar } from 'src/components/snackbar';
import CategorySelector from 'src/components/category-selector';
import FormProvider, { RHFSelect, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';

import { ICategory } from 'src/types/category';
import { IUserItem, USER_ADMIN_OPTIONS, USER_STATUS_OPTIONS } from 'src/types/user';

import { isUrl } from '../../utils/url';
import { IRole } from '../../types/role';
import RoleSelector from '../../components/role-selector';
import { useBoolean } from 'src/hooks/use-boolean';
import { IconButton, InputAdornment } from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
  mutate?: VoidFunction;
};

export default function UserNewEditForm({ currentUser, mutate }: Props) {
  const router = useRouter();
  const { id } = useParams();

  const { user } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('E-mail é obrigatório').email('Informe um e-mail válido'),
    password: Yup.string().required('Senha é obrigatório'),
    phone: Yup.string().nullable(),
    biography: Yup.string().nullable(),
    is_master: Yup.boolean().nullable(),
    active: Yup.boolean().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      password: currentUser?.password || '',
      active: currentUser?.active || true,
      phone: currentUser?.phone || null,
      biography: currentUser?.biography || '',
      is_master: currentUser?.is_master || false,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const password = useBoolean();

  const {
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (id) {
        await axiosInstance.put(endpoints.user.update(id as string), data);
      }

      if (!id) {
        await axiosInstance.post(endpoints.user.post, data);
      }

      reset();
      enqueueSnackbar(id ? successUpdateText('Usuário', true) : successCreateText('usuário', true));
      if (mutate) {
        mutate();
      }
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      enqueueSnackbar(id ? failUpdateText('usuário', true) : failCreateText('usuário', true), {
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
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label="Nome do usuário *" data-cy="user-name" />

              <RHFTextField
                name="password"
                label="Nova Senha"
                type={password.value ? 'text' : 'password'}
                data-cy="forgot-password-new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="email"
                disabled={Boolean(currentUser)}
                label="E-mail *"
                value={currentUser?.email}
                data-cy="user-email"
              />

              <RHFTextField name="phone" label="Numero de telefone" data-cy="user-phone" />

              <RHFTextField name="biography" label="Mini Bio" data-cy="user-biography" />

              <RHFSelect name="is_master" label="Admin? *" data-cy="user-active">
                {USER_ADMIN_OPTIONS.map((status) => (
                  <MenuItem key={status.label} value={status.value as any} data-cy={status.dataCy}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="active" label="Situação *" data-cy="user-active">
                {USER_STATUS_OPTIONS.map((status) => (
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
                data-cy="user-save"
              >
                {!currentUser ? 'Criar Usuário' : 'Salvar'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
