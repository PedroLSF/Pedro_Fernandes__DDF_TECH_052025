import { useForm, Controller } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useParams } from 'src/routes/hooks';

import useFetch from 'src/hooks/useFetch';

import axiosInstance, { endpoints } from 'src/utils/axios';

import FormProvider from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';

import { IUserItem } from '../../types/user';

// ----------------------------------------------------------------------
type INotificationBase = {
  title: string;
  content: string;
  slug: string;
  label: string;
};

const NOTIFICATIONS_HEADER = [
  {
    subheader: 'Gerais',
    caption: 'Notificações gerais',
    id: 'general-notifications',
  },
];

type Props = {
  currentUser: IUserItem;
  mutate?: VoidFunction;
};

// ----------------------------------------------------------------------

export default function UserNotifications({ currentUser, mutate }: Props) {
  const { data: notificationBase } = useFetch<INotificationBase[]>(
    endpoints.notification.getNotificationBase
  );

  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();

  const methods = useForm({
    defaultValues: {
      allowed: currentUser.notification_preferences?.allowed ?? [],
    },
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (dataForm) => {
    try {
      await axiosInstance.put(endpoints.user.updateProfile(id as string), {
        notification_preferences: { allowed: dataForm.allowed },
      });
      enqueueSnackbar('Atualizado com sucesso!');
      mutate?.();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao atualizar!', { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  });

  const getSelected = (selectedItems: string[], item: string) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        {NOTIFICATIONS_HEADER.map((header) => (
          <Grid key={header.id} container spacing={3}>
            <Grid xs={12} md={4}>
              <ListItemText
                primary={header.caption}
                secondary={header.subheader}
                primaryTypographyProps={{ typography: 'h6', mb: 0.5 }}
                secondaryTypographyProps={{ component: 'span' }}
              />
            </Grid>

            <Grid xs={12} md={8}>
              <Stack spacing={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
                <Controller
                  name="allowed"
                  control={control}
                  render={({ field }) => (
                    <>
                      {notificationBase?.map((item: any) => (
                        <FormControlLabel
                          key={item.slug}
                          label={item.label}
                          labelPlacement="start"
                          control={
                            <Switch
                              checked={field.value.includes(item.slug as never)}
                              onChange={() =>
                                field.onChange(getSelected(values.allowed, item.slug))
                              }
                              data-cy={`general-notifications-switch-${item.title}`}
                            />
                          }
                          sx={{
                            m: 0,
                            width: 1,
                            justifyContent: 'space-between',
                          }}
                        />
                      ))}
                    </>
                  )}
                />
              </Stack>
            </Grid>
          </Grid>
        ))}
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ ml: 'auto' }}
          data-cy="user-notifications-save"
        >
          Salvar alterações
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
