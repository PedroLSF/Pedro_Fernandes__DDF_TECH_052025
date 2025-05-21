import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { failGenericText, successGenericText } from 'src/utils/message';

import { useSnackbar } from 'src/components/snackbar';
import RoleSelector from 'src/components/role-selector';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { IUserItem, USER_STATUS_OPTIONS } from 'src/types/user';

import { IRole } from '../../types/role';
import axiosInstance, { endpoints } from '../../utils/axios';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser: IUserItem;
  onChange: VoidFunction;
};

export default function UserQuickEditForm({ currentUser, open, onClose, onChange }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().required('E-mail é obrigatório').email('Informe um e-mail válido'),
    active: Yup.boolean().required('Situação é obrigatório'),
    avatar: Yup.string().nullable(),
    phone: Yup.string().nullable(),
    linkedin_link: Yup.string().nullable(),
    instagram_link: Yup.string().nullable(),
    github_link: Yup.string().nullable(),
    behance_link: Yup.string().nullable(),
    biography: Yup.string().nullable(),
    role_id: Yup.mixed().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser.name || '',
      email: currentUser.email || '',
      active: currentUser.active || true,
      avatar: currentUser.avatar || '',
      phone: currentUser.phone || '',
      linkedin_link: currentUser.linkedin_link || '',
      instagram_link: currentUser.instagram_link || '',
      github_link: currentUser.github_link || '',
      behance_link: currentUser.behance_link || '',
      biography: currentUser.biography || '',
      role_id: currentUser.role_id || null,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    // reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    if (currentUser) {
      setValue('name', currentUser.name ?? '');
      setValue('email', currentUser.email ?? '');
      setValue('active', currentUser.active ?? '');
      setValue('avatar', currentUser.avatar ?? '');
      setValue('phone', currentUser.phone ?? '');
      setValue('linkedin_link', currentUser.linkedin_link ?? '');
      setValue('instagram_link', currentUser.instagram_link ?? '');
      setValue('github_link', currentUser.github_link ?? '');
      setValue('behance_link', currentUser.behance_link ?? '');
      setValue('biography', currentUser.biography ?? '');
    }
  }, [setValue, currentUser]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.role_id && typeof data.role_id !== 'string' && 'id' in data.role_id) {
        data.role_id = data.role_id.id;
      }
      const avatarStr = data.avatar ?? '';
      await axiosInstance.put(endpoints.user.update(currentUser.id), {
        ...data,
        avatar: avatarStr,
      });
      onClose();
      onChange();
      enqueueSnackbar(successGenericText());
    } catch (error) {
      console.error(error);
      enqueueSnackbar(failGenericText(), { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Edição rápida</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            py={2}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="name" label="Nome do usuário *" data-cy="quick-edit-user-name" />

            <RHFTextField
              name="email"
              disabled={Boolean(currentUser)}
              label="E-mail *"
              value={currentUser.email}
              data-cy="quick-edit-user-email"
            />

            <RHFTextField name="phone" label="Numero de telefone" data-cy="quick-edit-user-phone" />

            <RHFTextField
              name="linkedin_link"
              label="Link do Linkedin"
              data-cy="quick-edit-user-linkedin_link"
            />

            <RHFTextField
              name="instagram_link"
              label="Link do Instagram"
              data-cy="quick-edit-user-instagram_link"
            />

            <RHFTextField
              name="github_link"
              label="Link do Github"
              data-cy="quick-edit-user-github_link"
            />

            <RHFTextField
              name="behance_link"
              label="Link do Behance"
              data-cy="quick-edit-user-behance_link"
            />

            <RHFSelect name="active" label="Situação *" data-cy="quick-edit-user-active">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem data-cy={status.dataCy} key={status.label} value={status.value as any}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RoleSelector
              label="Funções"
              name="role_id"
              placeholder="Atribuir uma função"
              value={currentUser?.role as IRole}
              data-cy="role-selector-in-user"
            />
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            py={2}
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}
          >
            <RHFTextField
              name="biography"
              label="Mini Bio"
              data-cy="quick-edit-user-biography"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            data-cy="quick-edit-user-save"
          >
            Salvar
          </LoadingButton>

          <Button variant="outlined" onClick={onClose} data-cy="quick-edit-user-cancel">
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
