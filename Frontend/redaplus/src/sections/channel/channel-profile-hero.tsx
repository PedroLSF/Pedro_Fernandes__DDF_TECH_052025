import React from 'react';
import { m } from 'framer-motion';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { darken, hexToRgb } from '@mui/material/styles';
import { Box, alpha, IconButton, ListItemText } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { categoryPath } from 'src/utils/categoryPath';
import axiosInstance, { endpoints } from 'src/utils/axios';

import Image from 'src/components/image';
import { enqueueSnackbar } from 'src/components/snackbar';
import FileThumbnail from 'src/components/file-thumbnail';

import { paths } from '../../routes/paths';
import { IChannel } from '../../types/channel';
import Iconify from '../../components/iconify';
import { fDate, fTime } from '../../utils/format-time';
import VideoPreview from '../raw-content/video-preview';

type Props = {
  data: IChannel;
  mutate?: VoidFunction;
};
export default function ChannelProfileHero({ data, mutate }: Props) {
  const router = useRouter();
  const preview = useBoolean();
  const previewEnding = useBoolean();

  const handleRemoveVideo = async (option?: string) => {
    try {
      if (option === 'introduction') {
        await axiosInstance.put(endpoints.channel.put(data.id as string), {
          intro_id: null,
        });
        if (mutate) {
          mutate();
        }
        enqueueSnackbar('Introdução removida com sucesso', { variant: 'success' });
      } else if (option === 'ending') {
        await axiosInstance.put(endpoints.channel.put(data.id as string), {
          ending_id: null,
        });
        if (mutate) {
          mutate();
        }
        enqueueSnackbar('Encerramento removido com sucesso', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar('Error ao remover Vídeo(s)', { variant: 'error' });
    }
  };

  return (
    <Card>
      <VideoPreview
        currentContent={data?.intro as any}
        open={preview.value}
        onClose={preview.onFalse}
      />

      <VideoPreview
        currentContent={data?.ending as any}
        open={previewEnding.value}
        onClose={previewEnding.onFalse}
      />
      <Stack spacing={3} p={3}>
        <Grid container rowSpacing={1} justifyContent="flex-start">
          <Grid xs={12} md={6}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack>
                <Stack spacing={1}>
                  <Typography variant="h4">{data?.name}</Typography>
                </Stack>

                <Stack direction="column" alignItems="flex-start" justifyContent="space-between">
                  <Stack direction="row">
                    <Button
                      variant="text"
                      startIcon={<Iconify icon="solar:pen-bold" />}
                      onClick={() => router.push(paths.dashboard.channel.edit(data?.id))}
                      sx={{ borderRadius: 1 }}
                      data-cy="edit-channel-profile"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="text"
                      startIcon={<Iconify icon="fluent:video-add-20-regular" />}
                      onClick={() => router.push(paths.dashboard.channel.editTabTwo(data?.id))}
                      sx={{ borderRadius: 1 }}
                      data-cy="edit-channel-profile"
                    >
                      Adicionar vídeos
                    </Button>
                  </Stack>

                  {data.description && (
                    <Stack sx={{ mt: 2, maxWidth: 600, wordBreak: 'break-word' }}>
                      <Typography variant="h6">Descrição:</Typography>
                      <Typography variant="body1">{data?.description}</Typography>
                    </Stack>
                  )}

                  <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                    {data &&
                      data?.tagChannels?.map((item: any) => {
                        const fontColor = darken(hexToRgb(item.tag.color), 0.8);
                        return (
                          <Tooltip title={item.tag.name} key={item.id}>
                            <Chip
                              label={item.tag.name}
                              sx={{
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                padding: '0.2rem',
                                letterSpacing: '1px',
                                backgroundColor: item.tag.color,
                                color: fontColor,
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Stack
              sx={{ mt: 2 }}
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
            >
              <Stack>
                <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Iconify
                    icon="circum:calendar-date"
                    sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                  />
                  <Typography variant="inherit">
                    {fDate(data?.created_at)} {fTime(data?.created_at)}
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Iconify
                    icon="humbleicons:exchange-horizontal"
                    sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                  />
                  <Typography variant="inherit">
                    {fDate(data?.updated_at)} {fTime(data?.updated_at)}
                  </Typography>
                </Stack>
              </Stack>
              <Chip
                label={data?.active ? 'Ativo' : 'Inativo'}
                color={data?.active ? 'primary' : 'error'}
                variant="soft"
                sx={{
                  width: 150,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  p: '0.5rem',
                  letterSpacing: '1px',
                }}
              />
            </Stack>

            <Stack sx={{ mt: 2 }} direction="row" alignItems="flex-start" spacing={2}>
              <Paper
                elevation={0}
                square={false}
                sx={{
                  bgcolor: 'background.neutral',
                  py: 1,
                  px: 2,
                }}
              >
                <Stack spacing={1}>
                  <Typography color="darkgray">Possui miniatura padrão?</Typography>
                  <Typography variant="caption">
                    {data?.thumb?.image_url ? 'Sim' : 'Não'}
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                square={false}
                sx={{
                  bgcolor: 'background.neutral',
                  py: 1,
                  px: 2,
                }}
              >
                <Stack spacing={1}>
                  <Typography color="darkgray">Canal público?</Typography>
                  <Typography variant="caption">
                    {data?.type === 'public' ? 'Sim' : 'Não'}
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                square={false}
                sx={{
                  bgcolor: 'background.neutral',
                  py: 1,
                  px: 2,
                }}
              >
                <Stack spacing={1}>
                  <Typography color="darkgray">Possui logo ?</Typography>
                  <Typography variant="caption">{data?.logo?.id ? 'Sim' : 'Não'}</Typography>
                </Stack>
              </Paper>
            </Stack>

            {data?.type !== 'public' && (
              <Paper
                elevation={0}
                square={false}
                sx={{
                  mt: 2,
                  bgcolor: 'background.neutral',
                  py: 1,
                  px: 2,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="h6" color="darkgray">
                    Domínios:
                  </Typography>
                  {data?.domainChannels?.map((item: any) => (
                    <Typography key={item.id} variant="body1">
                      {item.domain.name}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}

            <Stack sx={{ mt: 2, maxWidth: 600, wordBreak: 'break-word' }}>
              <Typography variant="h6">Vinheta:</Typography>
            </Stack>

            <Box>
              {!data.intro_id ? (
                <Button
                  variant="text"
                  startIcon={<Iconify icon="fluent:video-add-20-regular" />}
                  onClick={() => router.push(paths.dashboard.channel.editTabThree(data?.id))}
                  sx={{
                    borderRadius: 1,
                    mt: 1,
                  }}
                  data-cy="edit-channel-profile"
                >
                  Adicionar introdução
                </Button>
              ) : (
                <Card
                  sx={{
                    width: 500,
                    mt: 1,
                    pt: 2,
                    pb: 2,
                    pl: 2,
                  }}
                >
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <ListItemText primary="Introdução" />

                    <Button
                      onClick={preview.onTrue}
                      sx={{
                        pt: 0,
                        px: 0,
                        mr: 2,
                        cursor: 'default',
                        width: '65px',
                        minWidth: 0,
                      }}
                    >
                      <Chip
                        data-cy="raw-video-preview-intro"
                        size="small"
                        variant="outlined"
                        label="Prévia"
                        sx={{
                          float: 'left',
                          border: 'none',
                          alignContent: 'center',
                          mt: 1,
                          justifyContent: 'center',
                          pt: 0,
                        }}
                        icon={
                          <Iconify
                            icon="tabler:player-play-filled"
                            color="gray"
                            sx={{
                              width: 13,
                              height: 'auto',
                              p: 0,
                            }}
                          />
                        }
                      />
                    </Button>

                    <IconButton
                      color="error"
                      size="large"
                      onClick={() => handleRemoveVideo('introduction')}
                      data-cy="intro-clear-button"
                      sx={{
                        mr: 2,
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Box>

                  <Stack
                    component={m.div}
                    spacing={1}
                    direction="row"
                    gap="10px"
                    sx={{
                      width: '98%',
                      p: 1,
                      borderRadius: 1,
                      border: (_theme) => `solid 1px ${alpha(_theme.palette.grey[500], 0.16)}`,
                    }}
                  >
                    <FileThumbnail file="video.mp4" sx={{ mt: 1 }} />

                    {/* TODO - Bring video format */}
                    <ListItemText
                      primary={data.intro.title}
                      secondary={
                        <>
                          <Iconify icon="mdi:label-multiple" sx={{ color: 'gray' }} />
                          {categoryPath(data.intro.category)}
                        </>
                      }
                      secondaryTypographyProps={{
                        component: 'span',
                        typography: 'caption',
                      }}
                    />
                  </Stack>
                </Card>
              )}
            </Box>

            <Box>
              {!data.ending_id ? (
                <Button
                  variant="text"
                  startIcon={<Iconify icon="fluent:video-add-20-regular" />}
                  onClick={() => router.push(paths.dashboard.channel.editTabThree(data?.id))}
                  sx={{
                    borderRadius: 1,
                    mt: 1,
                  }}
                  data-cy="edit-channel-profile"
                >
                  Adicionar encerramento
                </Button>
              ) : (
                <Card
                  sx={{
                    width: 500,
                    mt: 1,
                    pt: 2,
                    pb: 2,
                    pl: 2,
                  }}
                >
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <ListItemText primary="Encerramento" />

                    <Button
                      onClick={previewEnding.onTrue}
                      sx={{
                        pt: 0,
                        px: 0,
                        mr: 2,
                        cursor: 'default',
                        width: '65px',
                        minWidth: 0,
                      }}
                    >
                      <Chip
                        data-cy="raw-video-previewEnding-intro"
                        size="small"
                        variant="outlined"
                        label="Prévia"
                        sx={{
                          float: 'left',
                          border: 'none',
                          alignContent: 'center',
                          mt: 1,
                          justifyContent: 'center',
                          pt: 0,
                        }}
                        icon={
                          <Iconify
                            icon="tabler:player-play-filled"
                            color="gray"
                            sx={{
                              width: 13,
                              height: 'auto',
                              p: 0,
                            }}
                          />
                        }
                      />
                    </Button>

                    <IconButton
                      color="error"
                      size="large"
                      onClick={() => handleRemoveVideo('ending')}
                      data-cy="intro-clear-button"
                      sx={{
                        mr: 2,
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Box>
                  <Stack
                    component={m.div}
                    spacing={1}
                    direction="row"
                    gap="10px"
                    sx={{
                      width: '98%',
                      p: 1,
                      borderRadius: 1,
                      border: (_theme) => `solid 1px ${alpha(_theme.palette.grey[500], 0.16)}`,
                    }}
                  >
                    <FileThumbnail file="video.mp4" sx={{ mt: 1 }} />

                    {/* TODO - Bring video format */}
                    <ListItemText
                      primary={data.ending.title}
                      secondary={
                        <>
                          <Iconify icon="mdi:label-multiple" sx={{ color: 'gray' }} />
                          {categoryPath(data.ending.category)}
                        </>
                      }
                      secondaryTypographyProps={{
                        component: 'span',
                        typography: 'caption',
                      }}
                    />
                  </Stack>
                </Card>
              )}
            </Box>
          </Grid>

          {data?.thumb?.image_url && (
            <Grid xs={12} md={6}>
              <Image
                ratio="16/9"
                src={data?.thumb?.image_url}
                alt={data?.name}
                borderRadius={2}
                height={350}
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </Card>
  );
}
