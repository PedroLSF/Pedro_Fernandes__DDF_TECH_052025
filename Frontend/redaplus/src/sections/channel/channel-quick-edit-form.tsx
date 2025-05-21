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
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import { IChannel, CHANNEL_STATUS_OPTIONS } from 'src/types/channel';

import axiosInstance, { endpoints } from '../../utils/axios';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentChannel?: IChannel;
  onChange: VoidFunction;
};

export default function ChannelQuickEditForm({ currentChannel, open, onClose, onChange }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const NewChannelSchema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    description: Yup.string().optional(),
    type: Yup.string().required('Tipo é obrigatório'),
    active: Yup.boolean().required('Situação é obrigatório'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentChannel?.name || '',
      description: currentChannel?.description ?? '',
      type: currentChannel?.type || '',
      active: currentChannel?.active || false,
    }),
    [currentChannel]
  );

  const methods = useForm({
    resolver: yupResolver(NewChannelSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    if (currentChannel) {
      setValue('name', currentChannel.name);
      setValue('description', currentChannel.description ?? '');
      setValue('type', currentChannel.type);
      setValue('active', currentChannel.active);
    }
  }, [setValue, currentChannel]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.put(endpoints.channel.put(currentChannel?.id as string), data);
      reset();
      onClose();
      onChange();
      enqueueSnackbar(successGenericText());
      console.info('UPDATE CHANNEL', data);
    } catch (error) {
      enqueueSnackbar(failGenericText(), { variant: 'error' });
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
            <RHFTextField name="name" label="Nome do canal" data-cy="quick-edit-name" />

            <RHFSelect name="active" label="Situação" data-cy="quick-edit-status">
              {CHANNEL_STATUS_OPTIONS.map((active) => (
                <MenuItem key={active.label} value={active.value as any} data-cy={active.dataCy}>
                  {active.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>
          <RHFTextField
            name="description"
            label="Descrição do Canal"
            multiline
            rows={4}
            data-cy="quick-edit-description"
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} data-cy="cancel-quick-edit">
            Cancelar
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            data-cy="save-quick-edit"
            loading={isSubmitting}
          >
            Salvar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
