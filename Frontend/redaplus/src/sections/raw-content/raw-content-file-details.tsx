import { useForm } from 'react-hook-form';
import { endOfDay, startOfDay } from 'date-fns';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import TabList from '@mui/lab/TabList';
import Stack from '@mui/material/Stack';
import TabPanel from '@mui/lab/TabPanel';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TabContext from '@mui/lab/TabContext';
import { Paper, Avatar } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import Typography from '@mui/material/Typography';
import Drawer, { DrawerProps } from '@mui/material/Drawer';

import { useFilter } from 'src/hooks/use-filter';
import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';
import { failUpdateText, successUpdateText } from 'src/utils/message';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { RHFSwitch } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import FormProvider from 'src/components/hook-form/form-provider';

import { IArchive } from 'src/types/archive';
import { PermissionSlug } from 'src/types/role';
import { IVideo, VideoHumanType } from 'src/types/video';
import { ILogs, actionTranslation } from 'src/types/logs';
import { IPaginated, defaultPaginated } from 'src/types/pagination';

import { drawerSettings } from '../../theme/sizes';
import RawContentThumbnail from './raw-content-thumbnail';
import { downloadFile, downloadVideo } from '../../utils/video';
import { IContentItem, IContentTableFilters } from '../../types/content';

// ----------------------------------------------------------------------

type Props = DrawerProps & {
  rowId: string;
  item: IContentItem | IArchive;
  onClose: VoidFunction;
  video: IVideo;
  mutate: VoidFunction;
  category?: string;
  time?: string;
};

export default function RawContentFileDetails({
  item,
  open,
  rowId,
  onClose,
  video,
  mutate,
  category,
  time,
  ...other
}: Props) {
  const defaultFilters: Partial<IContentTableFilters> = {
    start_date: null,
    end_date: null,
    resource_id: rowId,
  };

  const { enqueueSnackbar } = useSnackbar();

  const { can } = useAuthContext();

  const confirm = useBoolean();

  const [tabValue, setTabValue] = useState('1');

  const handleChangeTabs = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const onDownload = async () => {
    if (item?.id.startsWith('fle_')) {
      await downloadFile({
        id: item.id,
        onError: (message) => {
          enqueueSnackbar({
            message,
            variant: 'error',
          });
        },
      });
    } else {
      await downloadVideo({
        video_id: item.id,
        onError: (message) => {
          enqueueSnackbar({
            message,
            variant: 'error',
          });
        },
      });
    }
  };

  const methods = useForm();

  const { reset, handleSubmit } = methods;

  const onSubmit = handleSubmit(async () => {
    try {
      if (item?.id.startsWith('fle_')) {
        await axiosInstance.put(endpoints.file.update(item.id), {
          active: !item.active,
        });
      } else {
        await axiosInstance.put(endpoints.video.update(item.id), {
          active: !item.active,
        });
      }

      enqueueSnackbar(successUpdateText('Situação', false));
      mutate();
      reset();
    } catch (error) {
      enqueueSnackbar(failUpdateText('situação', false), { variant: 'error' });
      console.error(error);
    }
  });

  const [data, setData] = useState<IPaginated<ILogs>>(defaultPaginated);

  const { filters, applyFilters } = useFilter<Partial<IContentTableFilters>>({
    initialFilters: defaultFilters,
    handler: async (filter) => {
      const response = await fetcher([
        endpoints.logs.rawVideo,
        {
          params: {
            take: 50,
            skip: 0,
            filter,
          },
        },
      ]);
      setData(response);
    },
  });

  function handleChangeInitialDateFilters(value: string | Date | number) {
    if ((typeof value === 'string' && value === 'Invalid Date') || Number.isNaN(value)) {
      return;
    }

    filters.start_date = startOfDay(new Date(value));
  }

  function handleChangeFinalDateFilters(value: string | Date | number) {
    if ((typeof value === 'string' && value === 'Invalid Date') || Number.isNaN(value)) {
      return;
    }

    filters.end_date = endOfDay(new Date(value));
  }

  async function handleDelete() {
    try {
      confirm.onFalse();
      let response = null;
      if (item?.id.startsWith('fle_')) {
        response = await axiosInstance.delete(endpoints.file.delete(item.id));
      } else {
        response = await axiosInstance.delete(endpoints.video.delete(video.id));
      }
      if (response.status === 200) {
        enqueueSnackbar({ message: 'Video excluído com sucesso', variant: 'success' });
        onClose();
      }
      mutate();
    } catch (error) {
      enqueueSnackbar({ message: 'Erro ao excluir vídeo', variant: 'error' });
      if (error.message) {
        enqueueSnackbar({ message: error.message, variant: 'error' });
      }
    }
  }

  const renderCategories = (
    <Card sx={{ p: 2 }} data-cy="video-content-categories">
      <Stack
        spacing={0.5}
        direction="row"
        alignItems="center"
        sx={{ typography: 'body2', fontWeight: 700 }}
      >
        Diretório:
      </Stack>
      <Stack
        spacing={0.5}
        direction="row"
        alignItems="start"
        sx={{
          pt: 0,
          mt: 1,
          typography: 'caption',
          wordBreak: 'break-all',
        }}
      >
        <Iconify
          icon="mdi:label-multiple"
          sx={{ color: 'gray', minWidth: '18px', width: '18px' }}
        />
        {category}
      </Stack>
    </Card>
  );

  useEffect(() => {
    if (tabValue === '2') {
      applyFilters();
    }
    // eslint-disable-next-line
  }, [tabValue]);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: drawerSettings.content.width },
        }}
        {...other}
      >
        <Scrollbar sx={{ height: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="h6"> Detalhes do Arquivo </Typography>
            {
              // eslint-disable-next-line no-nested-ternary
              'human_type' in item ? (
                video?.human_type === VideoHumanType.raw ? (
                  <Chip
                    size="small"
                    variant="soft"
                    label="Bruto"
                    sx={{ float: 'left' }}
                    icon={<Iconify icon="tabler:wood" color="seagreen" />}
                  />
                ) : (
                  <Chip
                    size="small"
                    variant="soft"
                    label="Editado"
                    sx={{ float: 'left' }}
                    icon={<Iconify icon="solar:clapperboard-edit-bold" color="seagreen" />}
                  />
                )
              ) : null
            }
          </Stack>

          <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={tabValue}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderTop: 1,
                  borderColor: 'divider',
                  pr: 2.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  pl: 2.5,
                }}
              >
                <TabList onChange={handleChangeTabs} sx={{ float: 'left' }}>
                  <Tab label="Informações" value="1" data-cy="video-information" />
                  <Tab label="Histórico" value="2" data-cy="video-historic" />
                </TabList>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'space-between',
                    display: 'flex',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <FormProvider methods={methods}>
                    <RHFSwitch
                      data-cy="raw-video-active"
                      onClick={onSubmit}
                      checked={item?.active}
                      name={`active-${item.id}`}
                      label={item?.active ? 'Ativo' : 'Inativo'}
                      color="success"
                    />
                  </FormProvider>
                </Stack>
              </Box>
              <TabPanel value="1" key="tabPanel1">
                <Stack spacing={2.5} justifyContent="center">
                  <RawContentThumbnail
                    sx={{ width: 64, height: 64 }}
                    item={item}
                    onDownload={onDownload}
                    time={time}
                  />
                  <Divider sx={{ borderStyle: 'dashed' }} />

                  {renderCategories}
                </Stack>
              </TabPanel>

              <TabPanel value="2" key="tabPanel2">
                <RawContentThumbnail
                  sx={{ width: 64, height: 64 }}
                  item={item}
                  key={`thumb-${item.id}`}
                  time={time}
                />
                <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
                <Stack spacing={1.5} sx={{ mb: 3, px: 2.5, mt: 3 }}>
                  <Stack
                    spacing={2}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box data-cy="initial-date-filter-selected">
                      <DatePicker
                        label="Data Inicial"
                        onChange={(value: any) => handleChangeInitialDateFilters(value)}
                      />
                    </Box>

                    <Box data-cy="final-date-filter-selected">
                      <DatePicker
                        data-cy="final-date-filter"
                        label="Data Final"
                        onChange={(value: any) => handleChangeFinalDateFilters(value)}
                      />
                    </Box>

                    <Button
                      data-cy="search-data-button"
                      onClick={() => applyFilters()}
                      variant="text"
                      sx={{
                        backgroundColor: '#212B36',
                        color: 'white',
                        ':hover': { backgroundColor: '#354557' },
                        pt: 1.5,
                        pb: 1.5,
                        pl: 3,
                        pr: 3,
                      }}
                    >
                      Pesquisar
                    </Button>
                  </Stack>
                </Stack>
                {data?.results?.map((log, index) => (
                  <Stack spacing={1.5} sx={{ px: 3, pb: 2, pt: 2 }} key={index}>
                    <Stack direction="row" spacing={2} data-cy={`log-videos-${log.id}`}>
                      <Avatar
                        alt={log.user?.name}
                        src={log.user?.avatar}
                        data-cy={`avatar-log-videos-${log.id}`}
                      />

                      <Paper
                        sx={{
                          p: 1.5,
                          flexGrow: 1,
                          bgcolor: 'background.neutral',
                        }}
                        data-cy={`dialog-box-log-videos-${log.id}`}
                      >
                        <Stack
                          sx={{ mb: 0.5 }}
                          alignItems={{ sm: 'center' }}
                          justifyContent="space-between"
                          direction={{ xs: 'column', sm: 'row' }}
                        >
                          <Box
                            sx={{ typography: 'subtitle2' }}
                            data-cy={`name-log-videos-${log.id}`}
                          >
                            {log.user?.name}
                          </Box>

                          <Box
                            sx={{ typography: 'caption', color: 'text.disabled' }}
                            data-cy={`createdAt-log-videos-${log.id}`}
                          >
                            {fDateTime(log.created_at)}
                          </Box>
                        </Stack>

                        <Box
                          sx={{ typography: 'body2', color: 'text.secondary' }}
                          data-cy={`action-log-videos-${log.id}`}
                        >
                          {actionTranslation[log.action]} : {log.description}
                        </Box>
                      </Paper>
                    </Stack>
                  </Stack>
                ))}
              </TabPanel>
            </TabContext>
          </Box>
        </Scrollbar>

        <Box sx={{ pt: 2.5, pb: 2.5 }}>
          <Stack direction="row" spacing={2} sx={{ pl: 2.5, pr: 2.5 }}>
            {can(PermissionSlug['delete-raw-videos']) && (
              <Button
                data-cy="raw-video-delete-button"
                fullWidth
                variant="soft"
                color="error"
                size="large"
                onClick={() => confirm.onTrue()}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Excluir
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir video bruto?"
        content="Tem certeza que deseja excluir?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete()}
            data-cy="confirm-delete"
          >
            Excluir
          </Button>
        }
      />
    </>
  );
}
