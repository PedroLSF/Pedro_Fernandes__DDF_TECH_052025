'use client';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { emailNotFound } from 'src/utils/message';
import axiosInstance, { endpoints } from 'src/utils/axios';

import { PasswordIcon } from 'src/assets/icons';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtForgetPassowrdView() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().required('E-mail é obrigatório.').email('E-mail deve ser válido.'),
  });

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const searchParams = new URLSearchParams({
        email: data.email,
      }).toString();

      await axiosInstance.put('', data);

      const href = `${paths.auth.jwt.new_password}?${searchParams}`;
      router.push(href);
    } catch (error) {
      enqueueSnackbar(emailNotFound(), {
        variant: 'error',
      });
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="email" label="Email" data-cy="forgot-password-email" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        data-cy="forgot-password-submit-button"
      >
        Enviar
      </LoadingButton>

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
        Voltar ao Login
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h3">Esqueceu sua senha?</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Digite o endereço de e-mail associado à sua conta e nós lhe enviaremos um código para
          redefinir sua senha.
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
