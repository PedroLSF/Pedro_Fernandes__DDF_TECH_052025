import { useSnackbar } from 'notistack';
import { isAfter, addHours } from 'date-fns';
import React, { useMemo, useState, Dispatch, useCallback, SetStateAction } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, Chip, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import TableRow, { tableRowClasses } from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { fDate, fTime } from 'src/utils/format-time';
import { categoryPath } from 'src/utils/categoryPath';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { fData, fSecondsToHms } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { PermissionSlug } from 'src/types/role';
import { VideoHumanType } from 'src/types/video';
import {
  stateIcons,
  VideoStatus,
  IContentItem,
  VideoTrackStatus,
  stateIconsSubtitle,
  contentStatusTranslation,
  contentStatusTranslationSubtitle,
} from 'src/types/content';

import ContentShare from './content-share';
import ContentFileDetails from './content-file-details';
import ContentChangeThumb from './content-change-thumb';
import VideoPreview from '../raw-content/video-preview';
import ContentQuickEditForm from './content-quick-edit-form';
import ContentFileDetailsEdit from './content-file-details-edit';
import ContentThumbnailTableRow from './content-thumbnail-table-row';
import ContentTableRowEmbedDialog from './content-table-row-embed-dialog';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: IContentItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  mutate: VoidFunction;
  setCategory: Dispatch<SetStateAction<string | null>>;
};

export default function ContentTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  mutate,
  setCategory,
}: Props) {
  const theme = useTheme();

  const { copy } = useCopyToClipboard();

  const { enqueueSnackbar } = useSnackbar();

  const { title, uploaded_at, updated_at, active, status, tracks } = row;

  const duration = fSecondsToHms(
    row.original_file_props?.duration ?? row.video_ffprobe_data?.format?.duration ?? 0
  );

  const { can } = useAuthContext();

  const quickEdit = useBoolean();

  const popoverId = usePopover();

  const preview = useBoolean();

  const details = useBoolean();

  const editDetails = useBoolean();

  const embedDetails = useBoolean();

  const changeThumbnail = useBoolean();

  const shareButton = useBoolean();

  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(
    (text: string) => {
      if (text) {
        copy(text).then(() => enqueueSnackbar('Copiado com sucesso!'));
      }
    },
    [copy, enqueueSnackbar]
  );

  const handleClick = useCallback(() => {
    if (can(PermissionSlug['edit-content'])) {
      editDetails.onTrue();
      return;
    }
    details.onTrue();
  }, [can, details, editDetails]);

  const handlePage = useCallback(() => {
    if (can(PermissionSlug['edit-content'])) {
      window.open(`/dashboard/content/?selectedVideoId=${row?.id}`, '_blank');
    }
  }, [can, row]);

  const handleEmbedDetails = useCallback(() => {
    embedDetails.onTrue();

    setTimeout(() => {
      details.onFalse();
    }, 50);
  }, [embedDetails, details]);

  const handleIdDetails = useCallback((e: any) => {
    popoverId.onOpen(e);
    setTimeout(() => {
      details.onFalse();
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackSubtitle = useMemo(() => {
    if (!row?.tracks) return null;
    return row.tracks.find((track) => track.auto_generated === true);
  }, [row?.tracks]);

  const canEdit = useMemo(() => {
    if (trackSubtitle && trackSubtitle.status === VideoTrackStatus.subtitle_generated) return false;
    if (row.status === VideoStatus.waiting_encode) return false;
    if (!trackSubtitle) return true;

    const now = new Date();
    const createdAtDate = new Date(trackSubtitle.created_at);
    const updatedAtDate = new Date(trackSubtitle.updated_at ?? trackSubtitle.created_at);

    return (
      isAfter(now, addHours(createdAtDate, 24)) &&
      isAfter(now, addHours(updatedAtDate, 24)) &&
      trackSubtitle.status === VideoTrackStatus.waiting_subtitle
    );
  }, [trackSubtitle, row.status]);

  const defaultStyles = {
    borderTop: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    '&:first-of-type': {
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      borderLeft: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
    '&:last-of-type': {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
  };

  return (
    <>
      <TableRow
        data-cy={`view-content-details-${row.id}`}
        selected={selected}
        sx={{
          borderRadius: 2,
          [`&.${tableRowClasses.selected}, &:hover`]: {
            backgroundColor: 'background.paper',
            boxShadow: theme.customShadows.z20,
            transition: theme.transitions.create(['background-color', 'box-shadow'], {
              duration: theme.transitions.duration.shortest,
            }),
            '&:hover': {
              backgroundColor: 'background.paper',
              boxShadow: theme.customShadows.z20,
            },
          },
          [`& .${tableCellClasses.root}`]: {
            ...defaultStyles,
          },
          ...(details.value && {
            [`& .${tableCellClasses.root}`]: {
              ...defaultStyles,
            },
          }),
        }}
      >
        <TableCell padding="checkbox" sx={{ pr: 0 }}>
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            data-cy={`content-checkbox-${row.id}`}
          />
        </TableCell>

        <TableCell sx={{ px: 0 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              sx={{
                maxWidth: '111px',
                minWidth: '111px',
              }}
              data-cy={`content-change-thumb-row-${row?.id}`}
              onClick={changeThumbnail.onTrue}
            >
              <ContentThumbnailTableRow item={row} />
            </Button>

            <Stack direction="column" alignContent="baseline">
              <Typography
                variant="inherit"
                sx={{
                  cursor: 'pointer',
                  ...(details.value && { fontWeight: 'fontWeightBold' }),
                  wordBreak: 'break-all',
                }}
                data-cy={`content-change-thumb-row-${title}`}
                onClick={handleClick}
              >
                {title}
              </Typography>
              <Stack
                direction="row"
                alignItems="start"
                spacing={0.5}
                onClick={() => setCategory(row.category?.id ?? null)}
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
                {categoryPath(row.category)}
              </Stack>
              <Stack direction="row">
                <Button
                  sx={{
                    pt: 0,
                    px: 0,
                    mt: 1,
                    cursor: 'default',
                    width: 'auto',
                    minWidth: 0,
                    maxWidth: 80,
                  }}
                >
                  <Chip
                    data-cy={`edit-view-count-${row?.id}`}
                    size="small"
                    variant="outlined"
                    label={row?.view_count}
                    sx={{
                      float: 'left',
                      border: 'none',
                      alignContent: 'center',
                      mt: 1,
                      justifyContent: 'center',
                      pt: 0,
                    }}
                    icon={
                      <Iconify icon="mdi:eye" color="gray" sx={{ width: 13, height: 'auto' }} />
                    }
                  />
                </Button>

                <Button
                  onClick={handleIdDetails}
                  sx={{
                    pt: 0,
                    px: 0,
                    mt: 1,
                    cursor: 'default',
                    width: '40px',
                    minWidth: 0,
                  }}
                >
                  <Chip
                    data-cy={`video-channel-view-id-${row?.id}`}
                    size="small"
                    variant="outlined"
                    label="ID"
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
                        icon="ic:baseline-code"
                        color="gray"
                        sx={{ width: 13, height: 'auto', p: 0 }}
                      />
                    }
                  />
                </Button>

                <Button
                  onClick={handleEmbedDetails}
                  sx={{
                    pt: 0,
                    px: 0,
                    mt: 1,
                    cursor: 'default',
                    width: '100px',
                    minWidth: 0,
                  }}
                >
                  <Chip
                    data-cy={`video-channel-view-embed-${row?.id}`}
                    size="small"
                    variant="outlined"
                    label={`Embed (${row?.videoChannels?.length ?? '-'})`}
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
                        icon="solar:wad-of-money-bold"
                        color="gray"
                        sx={{ width: 13, height: 'auto', p: 0 }}
                      />
                    }
                  />
                </Button>

                {can(PermissionSlug['view-preview-content']) && (
                  <Button
                    onClick={preview.onTrue}
                    data-cy={`content-video-preview-${row.id}`}
                    sx={{
                      pt: 0,
                      px: 0,
                      mt: 1,
                      cursor: 'default',
                      width: '65px',
                      minWidth: 0,
                    }}
                  >
                    <Chip
                      data-cy={`video-channel-view-embed-${row?.id}`}
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
                          sx={{ width: 13, height: 'auto', p: 0 }}
                        />
                      }
                    />
                  </Button>
                )}

                <Button
                  data-cy={`content-video-preview-${row.id}`}
                  sx={{
                    pt: 0,
                    px: 0,
                    cursor: 'default',
                    minWidth: 0,
                    mt: 1,
                  }}
                >
                  <Chip
                    data-cy={`video-channel-view-legend-${row?.id}`}
                    size="small"
                    variant="outlined"
                    label={`Legendas (${row?.tracks?.length ?? '-'})`}
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
                        icon="ic:baseline-type-specimen"
                        color="gray"
                        sx={{ width: 13, height: 'auto', p: 0 }}
                      />
                    }
                  />
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell
          onClick={handleClick}
          sx={{
            whiteSpace: 'nowrap',
            flexDirection: 'column',
          }}
        >
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              flexDirection: 'column',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'start',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title="Tamanho do arquivo" placement="top">
                <Iconify
                  icon="mage:video-player-fill"
                  sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                />
              </Tooltip>
              <Typography variant="inherit">
                {fData(row?.original_file_props?.size ?? 0)}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title="Tipo do arquivo" placement="top">
                <Iconify
                  icon="ic:baseline-type-specimen"
                  sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                />
              </Tooltip>
              <Typography variant="inherit">{row?.original_file_props?.type}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title="Duração do arquivo" placement="top">
                <Iconify
                  icon="solar:clock-circle-bold"
                  sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                />
              </Tooltip>
              <Typography variant="inherit">{duration}</Typography>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell onClick={handleClick} sx={{ whiteSpace: 'nowrap' }}>
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              flexDirection: 'column',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'start',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title="Data de Upload" placement="top">
                <Iconify
                  icon="mingcute:upload-3-fill"
                  sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                />
              </Tooltip>
              <Typography variant="inherit">
                {fDate(uploaded_at)} {fTime(uploaded_at)}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title="Data de Modificação" placement="top">
                <Iconify
                  icon="humbleicons:exchange-horizontal"
                  sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                />
              </Tooltip>
              <Typography variant="inherit">
                {fDate(updated_at)} {fTime(updated_at)}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell
          onClick={handleClick}
          sx={{
            whiteSpace: 'nowrap',
            flexDirection: 'column',
          }}
        >
          <Stack
            sx={{
              whiteSpace: 'nowrap',
              flexDirection: 'column',
              display: 'flex',
              alignContent: 'center',
              alignItems: 'start',
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title="Situação do arquivo" placement="top">
                <Iconify
                  icon={active ? 'mdi:check' : 'mdi:close'}
                  color="red"
                  sx={{ width: '15px', mr: 0.5, color: active ? '#22C55E' : '#FF5630' }}
                />
              </Tooltip>
              {active ? 'Ativo' : 'Inativo'}
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title="Situação do encoding do arquivo" placement="top">
                <Iconify
                  icon={stateIcons[status]}
                  sx={{
                    color: status === VideoStatus.error ? theme.palette.error.main : 'primary.main',
                    width: '15px',
                    mr: 0.5,
                  }}
                />
              </Tooltip>
              <Typography variant="inherit">{contentStatusTranslation[status]}</Typography>
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
              {tracks &&
                (() => {
                  const autoGeneratedTrack = tracks.find((track) => track.auto_generated === true);
                  if (!autoGeneratedTrack) return null;

                  const statusIcon =
                    stateIconsSubtitle[autoGeneratedTrack.status as VideoTrackStatus];
                  const statusText =
                    contentStatusTranslationSubtitle[autoGeneratedTrack.status as VideoTrackStatus];
                  const approved = autoGeneratedTrack.approved_by;

                  return (
                    <Stack
                      direction="column"
                      sx={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                    >
                      <Stack
                        direction="row"
                        sx={{ justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Tooltip title="Situação da geração de legenda automática" placement="top">
                          <Iconify
                            icon={statusIcon}
                            sx={{
                              color: 'primary.main',
                              width: '15px',
                              mr: 0.5,
                            }}
                          />
                        </Tooltip>
                        <Typography variant="inherit" sx={{ mr: 2 }}>
                          {statusText}
                        </Typography>
                      </Stack>

                      {(autoGeneratedTrack.status === VideoTrackStatus.none ||
                        autoGeneratedTrack.status === VideoTrackStatus.subtitle_generated) && (
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: 'center',
                            alignItems: 'start',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Tooltip title="Validação da legenda automática gerada" placement="top">
                            <Iconify
                              icon={
                                approved
                                  ? stateIconsSubtitle.subtitle_generated
                                  : stateIconsSubtitle.waiting_subtitle
                              }
                              sx={{
                                color: 'primary.main',
                                width: approved ? '15px' : '25px',
                                mr: 0.5,
                              }}
                            />
                          </Tooltip>
                          <Stack
                            direction="row"
                            sx={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              whiteSpace: 'wrap',
                            }}
                          >
                            <Typography variant="inherit">
                              {approved
                                ? 'Legenda Aprovada (IA)'
                                : 'Aguardando aprovação da Legenda (IA)'}
                            </Typography>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  );
                })()}
            </Stack>
          </Stack>
        </TableCell>

        <TableCell
          align="right"
          sx={{
            px: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {canEdit && (
            <Tooltip title="Gerar Legenda" placement="top" arrow>
              <IconButton
                data-cy={`content-video-generate-subtitle-${row.id}`}
                color="default"
                onClick={async () => {
                  try {
                    await axiosInstance.post(endpoints.encode.requestGenerateSubtitle, {
                      video_id: row.id,
                      language: 'pt',
                      label: row.title,
                    });
                    enqueueSnackbar('Gerando legenda(s).', {
                      variant: 'success',
                    });
                  } catch (error) {
                    if (error.message) {
                      enqueueSnackbar(error.message, { variant: 'error' });
                    }
                  }
                }}
              >
                <Box
                  component="img"
                  src="/assets/icons/files/ic_cc.svg"
                  sx={{
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          {can(PermissionSlug['edit-content']) &&
            row.human_type === VideoHumanType.edited &&
            row.status === VideoStatus.waiting_encode &&
            isAfter(new Date(), addHours(new Date(row.created_at), 24)) &&
            isAfter(new Date(), addHours(new Date(row.updated_at ?? row.created_at), 24)) && (
              <Tooltip title="Solicitar encode" placement="top" arrow>
                <IconButton
                  data-cy={`content-video-quick-edit-${row.id}`}
                  color="default"
                  onClick={async () => {
                    try {
                      await axiosInstance.post(endpoints.encode.requestVideoEncode, {
                        video_id: row.id,
                      });
                      enqueueSnackbar('Enviado para fila de encode.', { variant: 'success' });
                    } catch (error) {
                      if (error.message) {
                        enqueueSnackbar(error.message, { variant: 'error' });
                      }
                    }
                  }}
                >
                  <Iconify icon="system-uicons:refresh" />
                </IconButton>
              </Tooltip>
            )}
          {can(PermissionSlug['edit-content']) && (
            <Tooltip title="Editar em uma nova aba" placement="top" arrow>
              <IconButton
                data-cy={`content-video-quick-edit-${row.id}`}
                color={editDetails.value ? 'inherit' : 'default'}
                onClick={() => {
                  handlePage();
                }}
              >
                <Iconify icon="fluent-mdl2:page-arrow-right" />
              </IconButton>
            </Tooltip>
          )}
          {can(PermissionSlug['view-content']) && (
            <Tooltip title="Compartilhar" placement="top" arrow>
              <IconButton
                data-cy={`content-video-share-${row.id}`}
                color="default"
                onClick={shareButton.onTrue}
              >
                <Iconify icon="material-symbols:share" />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>

      {quickEdit.value && (
        <ContentQuickEditForm
          currentContent={row}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onChange={mutate}
        />
      )}

      {embedDetails.value && (
        <ContentTableRowEmbedDialog
          currentContent={row}
          open={embedDetails.value}
          onClose={embedDetails.onFalse}
        />
      )}

      {preview.value && (
        <VideoPreview currentContent={row} open={preview.value} onClose={preview.onFalse} />
      )}

      {changeThumbnail.value && (
        <ContentChangeThumb
          key={row.id}
          open={changeThumbnail.value}
          onClose={changeThumbnail.onFalse}
          mutate={mutate}
          currentContent={row}
        />
      )}

      {details.value && (
        <ContentFileDetails
          rowId={row.id}
          item={row}
          open={details.value}
          onClose={details.onFalse}
          onDelete={onDeleteRow}
          mutate={mutate}
          category={categoryPath(row.category)}
          time={duration}
        />
      )}

      {editDetails.value && (
        <ContentFileDetailsEdit
          rowId={row.id}
          item={row}
          open={editDetails.value}
          onClose={editDetails.onFalse}
          onDelete={onDeleteRow}
          mutate={mutate}
          category={categoryPath(row.category)}
          time={duration}
        />
      )}

      {shareButton.value && (
        <ContentShare open={shareButton.value} onClose={shareButton.onFalse} currentContent={row} />
      )}

      <CustomPopover
        open={popoverId.open}
        onClose={popoverId.onClose}
        arrow="top-left"
        sx={{ width: 250 }}
      >
        <TextField
          fullWidth
          value={row?.id}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
                  <IconButton
                    onClick={() => {
                      onCopy(`${row.id}`);
                      setCopied(true);
                    }}
                  >
                    <Iconify
                      icon={copied ? 'eva:checkmark-circle-2-fill' : 'eva:copy-fill'}
                      width={24}
                      color={copied ? 'green !important' : 'inherit'}
                    />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </CustomPopover>
    </>
  );
}
