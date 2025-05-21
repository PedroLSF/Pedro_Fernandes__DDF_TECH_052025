'use-client';

import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import TabList from '@mui/lab/TabList';
import Stack from '@mui/material/Stack';
import TabPanel from '@mui/lab/TabPanel';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TabContext from '@mui/lab/TabContext';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { darken, hexToRgb } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import { Paper, Avatar, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { fDateTime } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { RHFSwitch } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';

import { IContentItem, IContentTableFilters } from 'src/types/content';

import { downloadVideo } from '../../utils/video';
import { drawerSettings } from '../../theme/sizes';
import { VideoHumanType } from '../../types/video';
import ContentThumbnail from './content-thumbnail';
import { useFilter } from '../../hooks/use-filter';
import VideoPreview from '../raw-content/video-preview';
import ContentChangeThumb from './content-change-thumb';
import { ILogs, actionTranslation } from '../../types/logs';
import ContentNewTrackDialog from './content-new-track-dialog';
import ContentCaptionThumbnail from './content-caption-thumbnail';
import axiosInstance, { fetcher, endpoints } from '../../utils/axios';
import { IPaginated, defaultPaginated } from '../../types/pagination';
import { failUpdateText, successUpdateText } from '../../utils/message';

// ----------------------------------------------------------------------

type Props = DrawerProps & {
  rowId: string;
  item: IContentItem;
  onClose: VoidFunction;
  onDelete: VoidFunction;
  mutate: VoidFunction;
  category?: string;
  time?: string;
};

export default function ContentFileDetails({
  item,
  open,
  rowId,
  onClose,
  onDelete,
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
  const { copy } = useCopyToClipboard();

  const { enqueueSnackbar } = useSnackbar();

  const preview = useBoolean();

  const confirmThumb = useBoolean();

  const createVideoTrack = useBoolean();

  const methods = useForm({});

  const [videoTags] = useState(item?.tags);

  const [expanded, setExpanded] = useState<string | false>('panel1');

  const [expandTags, setExpandTags] = useState<Boolean>(true);

  const [tabValue, setTabValue] = useState('1');

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

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, []);

  const { reset, handleSubmit } = methods;

  const onSubmit = handleSubmit(async () => {
    try {
      await axiosInstance.put(endpoints.video.update(item.id), {
        active: !item.active,
      });
      enqueueSnackbar(successUpdateText('Situação', false));
      mutate();
      reset();
    } catch (error) {
      enqueueSnackbar(failUpdateText('situação', false), { variant: 'error' });
      console.error(error);
    }
  });

  const onCopy = useCallback(
    (text: string) => {
      if (text) {
        copy(text).then(() => enqueueSnackbar('Copiado com sucesso!'));
      }
    },
    [copy, enqueueSnackbar]
  );

  const handleChangeTabs = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const onDownload = async () => {
    await downloadVideo({
      video_id: item.id,
      onError: (message) => {
        enqueueSnackbar({
          message,
          variant: 'error',
        });
      },
    });
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  function handleChangeInitialDateFilters(value: string | Date | number) {
    if ((typeof value === 'string' && value === 'Invalid Date') || Number.isNaN(value)) {
      return;
    }

    filters.start_date =
      typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  }

  function handleChangeFinalDateFilters(value: string | Date | number) {
    if ((typeof value === 'string' && value === 'Invalid Date') || Number.isNaN(value)) {
      return;
    }

    filters.end_date =
      typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  }

  const renderTags = (
    <Stack sx={{ pt: 2.5, pb: 2.5 }}>
      <Stack direction="row" flexWrap="wrap" spacing={1} data-cy="content-vide-view-tags">
        <Accordion
          sx={{ width: '100%' }}
          expanded={expandTags === true}
          onChange={() => setExpandTags(!expandTags)}
        >
          <AccordionSummary
            aria-controls="panel1d-content"
            id="Tags"
            expandIcon={<Iconify icon="ic:round-expand-more" />}
          >
            Tags
          </AccordionSummary>

          <AccordionDetails>
            {videoTags &&
              videoTags.map((videoTag: any) => {
                const fontColor = darken(hexToRgb(videoTag?.tag?.color), 0.8);
                return (
                  <Tooltip title={videoTag?.tag?.name} key={videoTag?.tag?.id}>
                    <Chip
                      label={videoTag?.tag?.name}
                      sx={{
                        m: '2px',
                        width: 100,
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.2rem',
                        letterSpacing: '1px',
                        backgroundColor: videoTag?.tag.color,
                        color: fontColor,
                      }}
                    />
                  </Tooltip>
                );
              })}
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Stack>
  );

  const renderEmbeds = item.embeds && item.embeds.length > 0 && (
    <>
      <Typography>Embeds</Typography>
      {item?.embeds?.map((embed) => (
        <Accordion
          data-cy={`content-embed-${embed.embed_url}`}
          key={embed.embed_url}
          sx={{ width: '100%', backgroundColor: 'background.paper' }}
          expanded={expanded === embed.embed_url}
          onChange={handleChange(embed.embed_url)}
        >
          <AccordionSummary
            aria-controls="panel1d-content"
            id={embed.embed_url}
            expandIcon={<Iconify icon="ic:round-expand-more" />}
          >
            {embed.title}
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              disabled
              fullWidth
              label="Embed"
              multiline
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copiar">
                      <IconButton onClick={() => onCopy(embed.embed_url)}>
                        <Iconify icon="eva:copy-fill" width={24} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              value={embed.embed_url}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );

  const renderCategies = (
    <Card sx={{ p: 2 }} data-cy="video-content-categories">
      <Stack
        spacing={0.5}
        direction="row"
        alignItems="center"
        sx={{ typography: 'body2', fontWeight: 700 }}
      >
        Categoria:
      </Stack>
      <Stack spacing={0.5} direction="row" alignItems="center" sx={{ typography: 'caption' }}>
        <Iconify icon="mdi:label-multiple" sx={{ color: 'gray' }} />
        {category}
      </Stack>
    </Card>
  );

  const renderHeaderTabContext = (
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
      <TabList onChange={handleChangeTabs}>
        <Tab label="Informações" value="1" data-cy="video-information" />
        <Tab label="Legendas" value="2" data-cy="video-caption" />
        <Tab label="Histórico" value="3" data-cy="video-historic" />
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
            data-cy="content-video-active"
            onClick={onSubmit}
            checked={item?.active}
            name={`active-${item.id}`}
            label={item?.active ? 'Ativo' : 'Inativo'}
            color="success"
          />
        </FormProvider>
      </Stack>
    </Box>
  );

  const renderDescription = (
    <Stack direction="column" alignItems="center" justifyContent="space-between">
      <TextField
        data-cy="content-video-title"
        disabled
        fullWidth
        label="Titulo"
        defaultValue={item.title ?? ''}
        sx={{ pt: 2.5, pb: 2.5 }}
      />
      <TextField
        data-cy="content-video-description"
        disabled
        fullWidth
        multiline
        rows={4}
        defaultValue={item?.description ?? ''}
        label="Descrição"
        sx={{ pt: 2.5, pb: 2.5 }}
      />
    </Stack>
  );

  const renderPreview = (
    <Stack direction="row" alignItems="center" justifyContent="end" sx={{ p: 0 }}>
      <Button
        data-cy="content-video-preview-button"
        onClick={preview.onTrue}
        variant="contained"
        sx={{
          mr: 1,
          px: 5,
          backgroundColor: 'black',
          color: 'white',
          ':hover': { backgroundColor: '#354557' },
        }}
      >
        Prévia
      </Button>
    </Stack>
  );

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
            <Typography variant="h6"> Detalhes do conteúdo </Typography>
            {item?.human_type === VideoHumanType.raw ? (
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
            )}
          </Stack>

          <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={tabValue}>
              {renderHeaderTabContext}
              <TabPanel value="1" key="tabPanel1">
                <Stack
                  spacing={2.5}
                  justifyContent="center"
                  sx={{
                    p: 2.5,
                  }}
                >
                  <ContentThumbnail
                    sx={{ width: 64, height: 64 }}
                    item={item}
                    onDownload={onDownload}
                    time={time}
                  />
                  <Divider sx={{ borderStyle: 'dashed' }} />

                  {renderPreview}
                  {renderDescription}
                  {renderCategies}
                  {renderTags}
                  {renderEmbeds}
                </Stack>
              </TabPanel>
              <TabPanel value="2" key="tabPanel2">
                <ContentThumbnail sx={{ width: 64, height: 64 }} item={item} />

                <ContentCaptionThumbnail item={item} />

                <Stack direction="column" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ pt: 2.5, pb: 2.5 }}>
                    As legendas possibilitam que espectadores com problemas auditivos e pessoas que
                    falam outros idiomas tenham acesso ao vídeo. Adicione agora seu arquivo no
                    formato .srt ou .vtt (format UTF-8)
                  </Typography>
                </Stack>
              </TabPanel>
              <TabPanel value="3" key="tabPanel3">
                <ContentThumbnail sx={{ width: 64, height: 64 }} item={item} key={item.id} />
                <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />
                <Stack spacing={1.5} sx={{ mb: 3, px: 2.5, mt: 3 }}>
                  <Stack
                    spacing={2}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <DatePicker
                      data-cy="initial-date-filter"
                      label="Data Inicial"
                      onChange={(value: any) => handleChangeInitialDateFilters(value)}
                    />

                    <DatePicker
                      data-cy="final-date-filter"
                      label="Data Final"
                      onChange={(value: any) => handleChangeFinalDateFilters(value)}
                    />
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
                      <Avatar alt={log.user?.name} src={log.user?.avatar} />

                      <Paper
                        sx={{
                          p: 1.5,
                          flexGrow: 1,
                          bgcolor: 'background.neutral',
                        }}
                      >
                        <Stack
                          sx={{ mb: 0.5 }}
                          alignItems={{ sm: 'center' }}
                          justifyContent="space-between"
                          direction={{ xs: 'column', sm: 'row' }}
                        >
                          <Box sx={{ typography: 'subtitle2' }}>{log.user?.name}</Box>

                          <Box sx={{ typography: 'caption', color: 'text.disabled' }}>
                            {fDateTime(log.created_at)}
                          </Box>
                        </Stack>

                        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
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
      </Drawer>

      <VideoPreview currentContent={item} open={preview.value} onClose={preview.onFalse} />

      <ContentNewTrackDialog
        open={createVideoTrack.value}
        onClose={createVideoTrack.onFalse}
        video_id={item.id}
        mutate={mutate}
      />

      <ContentChangeThumb
        key={item.id}
        open={confirmThumb.value}
        onClose={confirmThumb.onFalse}
        mutate={mutate}
        currentContent={item}
      />
    </>
  );
}
