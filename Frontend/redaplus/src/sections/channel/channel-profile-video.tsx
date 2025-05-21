import { useSnackbar } from 'notistack';
import React, { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';
import { Typography, ImageListItemBar } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { fDate } from 'src/utils/format-time';
import { categoryPath } from 'src/utils/categoryPath';
import { fSecondsToHms } from 'src/utils/format-number';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { removeExtension } from '../../utils/video';
import ContentTableRowEmbedDialog from '../content/content-table-row-embed-dialog';
// ----------------------------------------------------------------------

type Props = {
  video: any;
  thumb: string;
  onDelete: VoidFunction;
  onSelected: VoidFunction;
  onUnselected: VoidFunction;
  onView: VoidFunction;
  hideThumb: boolean;
  disableRemove?: boolean;
};

export default function ChannelProfileVideo({
  video,
  thumb,
  onDelete,
  onSelected,
  onUnselected,
  onView,
  hideThumb,
  disableRemove = false,
}: Props) {
  const popoverId = usePopover();
  const embedDetails = useBoolean();

  const { enqueueSnackbar } = useSnackbar();
  const { copy } = useCopyToClipboard();

  const { title, created_at, category, view_count, id } = video;
  const pathSelected = categoryPath(category);

  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(
    (text: string) => {
      if (text) {
        copy(text).then(() => enqueueSnackbar('Copiado com sucesso!'));
      }
    },
    [copy, enqueueSnackbar]
  );

  function handleCheckboxChange(value: boolean) {
    if (disableRemove) {
      enqueueSnackbar('Não é possível remover vídeos que estão em playlists deste canal', {
        variant: 'warning',
      });
      return;
    }

    if (value) {
      onSelected();
      return;
    }
    onUnselected();
  }

  const handleEmbedDetails = useCallback(() => {
    embedDetails.onTrue();
  }, [embedDetails]);

  const renderHeader = (
    <Stack
      spacing={0.5}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      pb={0.5}
    >
      <Tooltip
        title={
          disableRemove ? 'Não é possível remover vídeos que estão em playlists deste canal' : ''
        }
        arrow
      >
        <span>
          <Checkbox
            onChange={(e, value) => handleCheckboxChange(value)}
            data-cy={`video-channel-checkbox-${video.title}`}
            disabled={disableRemove}
          />
        </span>
      </Tooltip>
      <Tooltip
        title={
          disableRemove ? 'Não é possível remover vídeos que estão em playlists deste canal' : ''
        }
        arrow
      >
        <span>
          <IconButton
            onClick={() => !disableRemove && onDelete()}
            sx={{
              typography: 'body2',
              borderRadius: '8px',
              color: disableRemove ? 'action.disabled' : 'error.main',
            }}
            disabled={disableRemove}
          >
            <Iconify
              icon="solar:trash-bin-trash-bold"
              sx={{ color: disableRemove ? 'action.disabled' : 'error.main' }}
              mx={0.5}
              data-cy={`trash-video-channel-checkbox-${video.title}`}
            />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );

  const renderImages = !hideThumb && (
    <Stack
      spacing={0.5}
      direction="row"
      sx={{
        p: (theme) => theme.spacing(0, 1, 0, 1),
      }}
    >
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        <Image alt={title} src={thumb} borderRadius={1} ratio="16/9" minHeight={150} />
        <ImageListItemBar
          sx={{ borderRadius: 1, height: '100%' }}
          actionIcon={
            <IconButton
              sx={{
                color: 'rgba(255, 255, 255, 0.54)',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 0,
              }}
              aria-label="play"
              onClick={onView}
              data-cy="video-channel-play"
            >
              <Iconify icon="carbon:play-filled" sx={{ color: 'inherit' }} width={100} />
            </IconButton>
          }
        />
      </Stack>
    </Stack>
  );

  const renderTexts = (
    <ListItemText
      sx={{
        p: (theme) => theme.spacing(2.5, 2.5, 2, 2.5),
      }}
      primary={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2"> Criado em: {fDate(created_at)} </Typography>
          <Stack direction="row" alignItems="center">
            <Iconify icon="solar:clock-circle-bold" sx={{ color: 'info.main' }} mx={0.4} />
            {video.original_file_props.duration
              ? fSecondsToHms(video.original_file_props.duration)
              : '-'}
          </Stack>
        </Stack>
      }
      secondary={
        <Typography
          variant="body1"
          color="inherit"
          data-cy={`title-video-channel-copy-embed-${video.title}`}
        >
          {removeExtension(title)}
        </Typography>
      }
      primaryTypographyProps={{
        typography: 'caption',
        color: 'text.disabled',
      }}
      secondaryTypographyProps={{
        mt: 1,
        noWrap: true,
        component: 'span',
        color: 'text.primary',
        typography: 'subtitle1',
      }}
    />
  );
  const renderInfo = (
    <Stack
      spacing={1}
      sx={{
        position: 'relative',
        p: (theme) => theme.spacing(0, 2.5, 2.5, 2.5),
      }}
    >
      <Stack
        spacing={1}
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
        />{' '}
        {pathSelected}
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
        <Iconify data-cy={`video-view-count-${id}`} icon="solar:eye-bold" sx={{ color: 'gray' }} />
        {view_count}
      </Stack>
    </Stack>
  );

  const renderFooter = (
    <Stack
      spacing={1}
      direction="row"
      alignItems="end"
      justifyContent="flex-start"
      sx={{
        p: (theme) => theme.spacing(0, 1, 2, 1),
      }}
    >
      <Stack spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
        <IconButton
          onClick={popoverId.onOpen}
          sx={{ typography: 'body2', borderRadius: '8px' }}
          data-cy={`video-channel-copy-id-${video.title}`}
        >
          <Iconify icon="ic:baseline-code" sx={{ color: 'gray' }} mx={0.5} /> ID
        </IconButton>
      </Stack>

      <Stack spacing={1} direction="row" alignItems="center">
        <IconButton
          onClick={handleEmbedDetails}
          sx={{ typography: 'body2', borderRadius: '8px' }}
          data-cy={`video-channel-copy-embed-${video.title}`}
        >
          <Iconify icon="radix-icons:code" mx={0.5} /> Embed
        </IconButton>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Card sx={{ padding: 1 }}>
        {renderHeader}
        {renderImages}
        {renderTexts}
        {renderInfo}
        {renderFooter}
      </Card>

      <CustomPopover
        open={popoverId.open}
        onClose={popoverId.onClose}
        arrow="top-left"
        sx={{ width: 250 }}
      >
        <TextField
          fullWidth
          value={video.id}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
                  <IconButton
                    onClick={() => {
                      onCopy(`${video.id}`);
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

      <ContentTableRowEmbedDialog
        currentContent={video}
        open={embedDetails.value}
        onClose={embedDetails.onFalse}
      />
    </>
  );
}
