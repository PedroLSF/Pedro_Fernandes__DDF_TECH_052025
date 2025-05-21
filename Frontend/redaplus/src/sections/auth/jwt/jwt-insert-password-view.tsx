'use client';

import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { decrypt } from 'src/utils/file';
import axiosInstance, { endpoints } from 'src/utils/axios';

import { PasswordIcon } from 'src/assets/icons';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import VideoPreview from 'src/sections/raw-content/video-preview';

// ----------------------------------------------------------------------

export default function JwtPasswordInsertView() {
  const [errorMsg, setErrorMsg] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  const searchParams = useSearchParams();

  const password = useBoolean();
  const preview = useBoolean();

  const ValidateSchema = Yup.object().shape({
    password: Yup.string().required('Senha é obrigatório.'),
  });

  const methods = useForm({
    resolver: yupResolver(ValidateSchema),
    defaultValues: {
      password: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await axiosInstance.post(endpoints.video.validatePreview, {
        video_id: searchParams.get('video_id'),
        expirationTime: searchParams.get('expirationTime'),
        videoPassword: data.password,
      });

      const decrypted = decrypt(response.data, process.env.NEXT_PUBLIC_HASH_SECRET_KEY as string);
      setDecryptedText(decrypted);
      preview.onTrue();
    } catch (error) {
      console.error(error);
      reset({ password: '' });
      setDecryptedText('');
      setErrorMsg(error?.message || 'Erro desconhecido');
    }
  });

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack
        spacing={1}
        sx={{
          mt: 3,
          mb: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <VideoPreview videoLink={decryptedText} open={preview.value} onClose={preview.onFalse} />
        <Typography variant="h3">Autenticador</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Digite a senha correspondente para liberar o vídeo solicitado.
        </Typography>
      </Stack>
    </>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField
        name="password"
        label="Senha"
        type={password.value ? 'text' : 'password'}
        data-cy="login-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end" data-cy="login-eye">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        data-cy="login-enter"
      >
        Confirmar
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
