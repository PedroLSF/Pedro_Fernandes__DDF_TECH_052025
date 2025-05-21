import React, { useCallback } from 'react';

import Box from '@mui/material/Box';
import { Chip } from '@mui/material';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import { CardProps } from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';
import { fData, fSecondsToHms } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FileThumbnail from 'src/components/file-thumbnail';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IArchive } from 'src/types/archive';
import { IVideoManager } from 'src/types/file-manager';

import { IVideo } from '../../types/video';
import { PermissionSlug } from '../../types/role';
import { useAuthContext } from '../../auth/hooks';
import { IContentItem } from '../../types/content';
import { categoryPath } from '../../utils/categoryPath';
import VideoPreview from '../raw-content/video-preview';
import { downloadFile, downloadVideo } from '../../utils/video';
import RawContentFileDetails from '../raw-content/raw-content-file-details';
import RawContentQuickEditForm from '../raw-content/raw-content-quick-edit-form';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  file: IVideoManager;
  selected?: boolean;
  onSelect?: VoidFunction;
  onDelete: VoidFunction;
  row?: IVideo | IArchive;
  mutate?: () => any;
}

export default function RawContentManagerFileItem({
  file,
  selected,
  onSelect,
  onDelete,
  row,
  mutate,
  sx,
  ...other
}: Props) {
  const { can } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const checkbox = useBoolean();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const quickEditFile = useBoolean();

  const details = useBoolean();

  const preview = useBoolean();

  const popover = usePopover();

  let duration = '0';
  if (row && 'video_ffprobe_data' in row) {
    duration = fSecondsToHms(
      row?.original_file_props?.duration ?? row?.video_ffprobe_data?.format?.duration ?? 0
    );
  }

  const handleDownload = useCallback(async (id: string) => {
    if (row?.id.startsWith('fle_')) {
      await downloadFile({
        id,
        onError: (message) => {
          enqueueSnackbar({
            message,
            variant: 'error',
          });
        },
      });
    } else {
      await downloadVideo({
        video_id: id,
        onError: (message) => {
          enqueueSnackbar({
            message,
            variant: 'error',
          });
        },
      });
    }

    // eslint-disable-next-line
  }, []);

  const renderIcon =
    (checkbox.value || selected) && onSelect ? (
      <Box onMouseEnter={checkbox.onTrue} onMouseLeave={checkbox.onFalse}>
        <Checkbox
          size="medium"
          checked={selected}
          onClick={onSelect}
          icon={<Iconify icon="eva:radio-button-off-fill" />}
          checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          sx={{ p: 0.75 }}
        />
      </Box>
    ) : (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box onMouseEnter={checkbox.onTrue} onMouseLeave={checkbox.onFalse}>
          <FileThumbnail
            file={file.type === 'video' ? file.type : file?.file?.original_file_props?.name}
            sx={{ width: 26, height: 26 }}
          />
        </Box>

        <Typography
          variant="subtitle2"
          sx={{
            color: 'text.secondary',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 13,
          }}
          onClick={details.onTrue}
          component="div"
        >
          {file.name}
        </Typography>
      </Stack>
    );

  const renderAction = (
    <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Stack>
  );

  const renderText = (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          maxWidth: 0.99,
          whiteSpace: 'nowrap',
          typography: 'caption',
          color: 'text.disabled',
        }}
      >
        <Iconify
          icon="humbleicons:exchange-horizontal"
          sx={{
            width: 15,
            height: 15,
          }}
          mr={0.4}
        />
        <Tooltip
          title={
            file.type === 'video'
              ? fDateTime(file.video?.updated_at) ?? fDateTime(file.modifiedAt)
              : fDateTime(file.file?.updated_at) ?? fDateTime(file.modifiedAt)
          }
        >
          <Typography noWrap component="span" variant="caption">
            {file.type === 'video'
              ? fDateTime(file.video?.updated_at) ?? fDateTime(file.modifiedAt)
              : fDateTime(file.file?.updated_at) ?? fDateTime(file.modifiedAt)}
          </Typography>
        </Tooltip>

        <Iconify
          icon="mage:video-player-fill"
          sx={{
            ml: '6px',
            width: 15,
            height: 15,
          }}
          mr={0.4}
        />
        <Tooltip title={fData(file.size)}>
          <Typography noWrap component="span" variant="caption">
            {fData(file.size)}
          </Typography>
        </Tooltip>

        {/* Novo item adicionado */}
        <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', ml: '6px' }}>
          <Iconify
            icon="ic:baseline-type-specimen"
            sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
          />
          <Tooltip title={file.video?.original_file_props?.type}>
            <Typography variant="inherit">{file.video?.original_file_props?.type}</Typography>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        sx={{
          maxWidth: 0.99,
          whiteSpace: 'nowrap',
          typography: 'caption',
          color: 'text.disabled',
        }}
      >
        {file.type === 'video' && (
          <>
            <Iconify
              icon="solar:clock-circle-bold"
              sx={{
                width: 15,
                height: 15,
              }}
              mr={0.4}
            />
            {duration ? fSecondsToHms(duration) : '-'}
          </>
        )}

        {can(PermissionSlug['preview-raw-videos']) && file.type === 'video' && (
          <Button
            size="small"
            onClick={preview.onTrue}
            data-cy={`content-video-preview-${row?.id}`}
            sx={{
              pt: 0,
              px: 0,
              cursor: 'default',
              ml: '5px',
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
                mt: '5px',
                justifyContent: 'center',
                pt: 0,
                color: 'gray',
                fontSize: '0.75rem;',
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
      </Stack>
    </>
  );

  return (
    <>
      <Stack
        component={Paper}
        variant="outlined"
        alignItems="flex-start"
        sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: 'unset',
          cursor: 'pointer',
          position: 'relative',
          ...((checkbox.value || selected) && {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...sx,
        }}
        {...other}
      >
        <Box>{renderIcon}</Box>

        {renderText}

        {renderAction}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            if (row?.id) {
              void handleDownload(row.id);
            }
          }}
        >
          <Iconify icon="mingcute:download-3-fill" />
          Download
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
            if (row?.id.startsWith('fle_')) {
              quickEditFile.onTrue();
            } else {
              quickEdit.onTrue();
            }
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      {row ? (
        <RawContentFileDetails
          rowId={row.id}
          item={row as unknown as IContentItem}
          video={row as unknown as IVideo}
          key={row.id}
          open={details.value}
          onClose={details.onFalse}
          mutate={() => void mutate?.()}
          category={categoryPath(row.category)}
          time={duration}
        />
      ) : null}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Você tem certeza que deseja deletar?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Excluir
          </Button>
        }
      />

      {row && row?.id.startsWith('vid_') && (
        <RawContentQuickEditForm
          currentContent={row}
          open={quickEdit.value}
          onClose={quickEdit.onFalse}
          onChange={mutate}
        />
      )}

      {row && row?.id.startsWith('fle') && (
        <RawContentQuickEditForm
          currentContent={row}
          open={quickEditFile.value}
          onClose={quickEditFile.onFalse}
          onChange={mutate}
        />
      )}

      {row && row?.id.startsWith('vid') && (
        <VideoPreview
          currentContent={row as IVideo}
          open={preview.value}
          onClose={preview.onFalse}
        />
      )}
    </>
  );
}
