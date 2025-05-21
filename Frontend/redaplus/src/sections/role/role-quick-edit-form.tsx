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
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

import { IRole } from 'src/types/role';

import { CATEGORY_STATUS_OPTIONS } from '../../_mock';
import axiosInstance, { endpoints } from '../../utils/axios';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentRole?: IRole;
  onChange: VoidFunction;
};

export default function RoleQuickEditForm({ currentRole, open, onClose, onChange }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const NewRoleSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    description: Yup.string().nullable(),
    active: Yup.boolean().required('Situação é obrigatório'),
    is_admin: Yup.boolean().required('Verificação de admin é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentRole?.name || '',
      description: currentRole?.description ?? '',
      active: currentRole?.active || true,
      is_admin: currentRole?.is_admin || false,
    }),
    [currentRole]
  );

  const methods = useForm({
    resolver: yupResolver(NewRoleSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  useEffect(() => {
    if (currentRole) {
      setValue('name', currentRole.name);
      setValue('description', currentRole.description ?? '');
      setValue('active', currentRole.active);
      setValue('is_admin', currentRole.is_admin);
    }
  }, [setValue, currentRole]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.put(`${endpoints.role}/${currentRole?.id}`, data);
      reset();
      onClose();
      onChange();
      enqueueSnackbar(successGenericText());
    } catch (error) {
      enqueueSnackbar(failGenericText(error), { variant: 'error' });
      console.error(error);
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
            <RHFTextField name="name" label="Nome da Função" data-cy="role-quick-name" />

            <RHFSelect name="active" label="Situação" data-cy="role-quick-active">
              {CATEGORY_STATUS_OPTIONS.map((active) => (
                <MenuItem key={active.label} value={active.value as any} data-cy={active.dataCy}>
                  {active.label}
                </MenuItem>
              ))}
            </RHFSelect>
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
              name="description"
              label="Descrição da Função"
              multiline
              rows={4}
              data-cy="role-quick-description"
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
            <RHFSwitch
              name="is_admin"
              label="Admin"
              color="success"
              checked={watch('is_admin')}
              data-cy="role-quick-admin"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} data-cy="role-quick-cancel-button">
            Cancelar
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            data-cy="role-quick-save-button"
          >
            Salvar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
