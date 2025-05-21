import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider, { RHFSelect, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';

import { isUrl } from '../../utils/url';
import axiosInstance, { endpoints } from '../../utils/axios';
import { IUserItem, USER_STATUS_OPTIONS } from '../../types/user';
import { failUpdateText, successUpdateText } from '../../utils/message';

// ----------------------------------------------------------------------

type Props = {
  currentUser: IUserItem;
};

export default function UserGeneral({ currentUser }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const deleteAvatar = useBoolean();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('E-mail é obrigatório').email('Informe um e-mail válido'),
    active: Yup.boolean().required('Situação é obrigatório'),
    phone: Yup.string().nullable(),
    linkedin_link: Yup.string().nullable(),
    instagram_link: Yup.string().nullable(),
    github_link: Yup.string().nullable(),
    behance_link: Yup.string().nullable(),
    biography: Yup.string().nullable(),
    avatar: Yup.mixed<any>().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      active: currentUser?.active || true,
      phone: currentUser?.phone || null,
      linkedin_link: currentUser?.linkedin_link || '',
      instagram_link: currentUser?.instagram_link || '',
      github_link: currentUser?.github_link || '',
      behance_link: currentUser?.behance_link || '',
      biography: currentUser?.biography || '',
      avatar: currentUser.avatar_url || null,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.avatar && typeof data.avatar !== 'string' && 'storage_key' in data.avatar) {
        data.avatar = data.avatar.storage_key;
      }
      if (isUrl(data.avatar)) {
        delete data.avatar;
      }
      await axiosInstance.put(endpoints.user.updateProfile(currentUser.id), data);
      enqueueSnackbar(successUpdateText('Usuário', true));
    } catch (error) {
      enqueueSnackbar(failUpdateText('usuário', true), {
        variant: 'error',
      });
      if (error?.message) {
        enqueueSnackbar(error?.message, {
          variant: 'error',
        });
      }
    }
  });

  const handleDeleteAvatar = async (id: string) => {
    try {
      await axiosInstance.put(endpoints.user.updateProfile(id), { avatar: null });

      enqueueSnackbar(successUpdateText('Usuário', true));

      setValue('avatar', null, { shouldValidate: true });
    } catch (error) {
      enqueueSnackbar(failUpdateText('usuário', true), {
        variant: 'error',
      });
      if (error?.message) {
        enqueueSnackbar(error?.message, {
          variant: 'error',
        });
      }
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid
          container
          spacing={3}
          sx={{ justifyContent: 'center', display: 'flex', alignContent: 'center' }}
        >
          <Grid xs={12} md={4}>
            <Card>
              <Stack sx={{ float: 'right', p: 1 }}>
                <Tooltip title="Deletar avatar">
                  <IconButton
                    color="error"
                    data-cy="delete-avatar-iconbutton"
                    onClick={() => {
                      deleteAvatar.onTrue();
                      setValue('avatar', []);
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box sx={{ mb: 4, mt: 4, p: 5 }}>
                <RHFUploadAvatar
                  setValue={setValue}
                  name="avatar"
                  maxSize={3145728}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      Formatos aceitos: *.jpeg, *.jpg, *.png, *.gif
                      <br /> Tamanho máximo {fData(3145728)}
                    </Typography>
                  }
                />
              </Box>
            </Card>
          </Grid>

          <Grid xs={12} md={8}>
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
                  name="email"
                  disabled={Boolean(currentUser)}
                  label="E-mail *"
                  value={currentUser?.email}
                  data-cy="user-email"
                />

                <RHFTextField name="phone" label="Numero de telefone" data-cy="user-phone" />

                <RHFTextField
                  name="linkedin_link"
                  label="Link do Linkedin"
                  data-cy="user-linkedin_link"
                />

                <RHFTextField
                  name="instagram_link"
                  label="Link do Instagram"
                  data-cy="user-instagram_link"
                />

                <RHFTextField
                  name="github_link"
                  label="Link do Github"
                  data-cy="user-github_link"
                />

                <RHFTextField
                  name="behance_link"
                  label="Link do Behance"
                  data-cy="user-behance_link"
                />

                <RHFTextField name="biography" label="Mini Bio" data-cy="user-biography" />

                <RHFSelect name="active" label="Situação *" data-cy="user-active">
                  {USER_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.label} value={status.value as any}>
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
      <ConfirmDialog
        open={deleteAvatar.value}
        onClose={deleteAvatar.onFalse}
        title="Excluir usuário"
        content="Tem certeza que deseja excluir?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteAvatar(currentUser?.id).then(() => deleteAvatar.onFalse())}
            data-cy="user-general-delete"
          >
            Excluir
          </Button>
        }
      />
    </>
  );
}
