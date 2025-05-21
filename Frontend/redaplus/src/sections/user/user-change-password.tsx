import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { yupResolver } from '@hookform/resolvers/yup';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import axiosInstance, { endpoints } from '../../utils/axios';
import { failUpdatePassword, successUpdatePassword } from '../../utils/message';

// ----------------------------------------------------------------------

export default function UserChangePassword() {
  const { id } = useParams<{ id: string }>();

  const { enqueueSnackbar } = useSnackbar();

  const current_password = useBoolean();
  const new_password = useBoolean();
  const confirm_password = useBoolean();

  const ChangePassWordSchema = Yup.object().shape({
    current_password: Yup.string().required('Senha antiga é obrigatória'),
    new_password: Yup.string()
      .required('Nova senha é obrigatória')
      .min(8, 'A senha deve conter pelo menos 8 caracteres')
      .min(8, 'A senha deve conter pelo menos 8 caracteres')
      .matches(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .matches(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .matches(/[0-9]/, 'A senha deve conter pelo menos um número')
      .matches(/[!@#$%^&*()_-]/, 'A senha deve conter pelo menos um caractere especial')
      .test(
        'no-match',
        'Nova senha deve ser diferente da antiga',
        (value, { parent }) => value !== parent.current_password
      ),
    confirm_password: Yup.string().oneOf(
      [Yup.ref('new_password')],
      'As senhas precisam ser iguais'
    ),
  });

  const defaultValues = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.put(endpoints.user.changePassword(id), data);

      reset();
      enqueueSnackbar(successUpdatePassword());
      // router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      enqueueSnackbar(failUpdatePassword(), {
        variant: 'error',
      });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        <RHFTextField
          data-cy="current_password"
          name="current_password"
          type={current_password.value ? 'text' : 'password'}
          label="Senha antiga"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={current_password.onToggle}
                  edge="end"
                  data-cy="current-password-button"
                >
                  <Iconify
                    icon={current_password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          data-cy="new_password"
          name="new_password"
          label="Nova senha"
          type={new_password.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={new_password.onToggle}
                  edge="end"
                  data-cy="new-password-button"
                >
                  <Iconify icon={new_password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={
            <Stack component="span" direction="row" alignItems="center">
              <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} /> A senha deve conter pelo
              8 menos caracteres
            </Stack>
          }
        />

        <RHFTextField
          data-cy="confirm_password"
          name="confirm_password"
          type={confirm_password.value ? 'text' : 'password'}
          label="Confirmar nova senha"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={confirm_password.onToggle}
                  edge="end"
                  data-cy="confirm-password-button"
                >
                  <Iconify
                    icon={confirm_password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          data-cy="change-password-save-button"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ ml: 'auto' }}
        >
          Salvar alterações
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
