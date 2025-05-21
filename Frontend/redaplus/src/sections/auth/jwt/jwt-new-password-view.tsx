'use client';

import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCountdownSeconds } from 'src/hooks/use-countdown';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { emailNotFound, recoveryPasswordFail } from 'src/utils/message';

import { SentIcon } from 'src/assets/icons';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFCode, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtNewPasswordView() {
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get('email');

  const password = useBoolean();

  const { countdown, counting, startCountdown } = useCountdownSeconds(60);

  const VerifySchema = Yup.object().shape({
    reset_password_code: Yup.string()
      .min(6, 'O código deve ter ao menos 6 caracteres.')
      .required('Código é obrigatório.'),
    email: Yup.string().required('Email é obrigatório.').email('Email deve ser válido.'),
    new_password: Yup.string()
      .min(8, 'Senha deve ter ao menos 8 caracteres.')
      .required('Senha é obrigatória.')
      .required('Nova senha é obrigatória')
      .min(8, 'A senha deve conter pelo menos 8 caracteres')
      .matches(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .matches(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .matches(/[0-9]/, 'A senha deve conter pelo menos um número')
      .matches(/[!@#$%^&*()_-]/, 'A senha deve conter pelo menos um caractere especial'),
    confirm_password: Yup.string()
      .required('Confirmar senha é obrigatório.')
      .oneOf([Yup.ref('new_password')], 'As senhas devem ser iguais.'),
  });

  const defaultValues = {
    reset_password_code: '',
    email: email || '',
    new_password: '',
    confirm_password: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.put(endpoints.user.confirmForgotPassword, data);

      router.push(paths.auth.jwt.login);
    } catch (error) {
      enqueueSnackbar(recoveryPasswordFail(), {
        variant: 'error',
      });
    }
  });

  const handleResendCode = useCallback(async () => {
    try {
      startCountdown();
      await axiosInstance.put(endpoints.user.forgotPassword, { email });
    } catch (error) {
      enqueueSnackbar(emailNotFound(), {
        variant: 'error',
      });
    }
  }, [email, enqueueSnackbar, startCountdown]);

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField
        name="email"
        label="E-mail"
        placeholder="example@gmail.com"
        InputLabelProps={{ shrink: true }}
      />

      <RHFCode name="reset_password_code" data-cy="forgot-password-code" />

      <RHFTextField
        name="new_password"
        label="Nova Senha"
        type={password.value ? 'text' : 'password'}
        data-cy="forgot-password-new-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <RHFTextField
        name="confirm_password"
        label="Confirmar Nova Senha"
        data-cy="forgot-password-confirm-new-password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        data-cy="forgot-password-button-send-new-password"
        loading={isSubmitting}
      >
        Atualizar Senha
      </LoadingButton>

      <Typography variant="body2">
        {`Não recebeu o código? `}
        <Link
          variant="subtitle2"
          data-cy="re-send-code"
          onClick={handleResendCode}
          sx={{
            cursor: 'pointer',
            ...(counting && {
              color: 'text.disabled',
              pointerEvents: 'none',
            }),
          }}
        >
          Reenviar Código {counting && `(${countdown}s)`}
        </Link>
      </Typography>

      <Link
        data-cy="back-to-login-button"
        component={RouterLink}
        href={paths.auth.jwt.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Voltar para o Login
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <SentIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h3">Solicitação enviada com sucesso!</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enviamos um e-mail de confirmação de 6 dígitos para seu e-mail. Por favor, digite o código
          para confirmar seu e-mail.
        </Typography>
      </Stack>
    </>
  );

  return (
    <>
      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
