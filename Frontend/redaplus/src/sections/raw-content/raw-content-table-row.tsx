import React, { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { Chip, Button, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import TableRow, { tableRowClasses } from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { fDate, fTime } from 'src/utils/format-time';
import { categoryPath } from 'src/utils/categoryPath';
import { fData, fSecondsToHms } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { PermissionSlug } from 'src/types/role';

import { IVideo } from '../../types/video';
import VideoPreview from './video-preview';
import RawContentFileDetails from './raw-content-file-details';
import RawFileThumbnail from './raw-content-thumbnail-table-row';
import RawContentQuickEditForm from './raw-content-quick-edit-form';
import { stateIcons, IContentItem, contentStatusTranslation } from '../../types/content';

// ----------------------------------------------------------------------

type Props = {
  row: IContentItem;
  selected: boolean;
  onSelectRow: VoidFunction;
  mutate: VoidFunction;
};

export default function RawContentTableRow({ row, selected, onSelectRow, mutate }: Props) {
  const theme = useTheme();

  const { title, uploaded_at, updated_at, active, status } = row;

  const duration = fSecondsToHms(
    row.original_file_props?.duration ?? row.video_ffprobe_data?.format?.duration ?? 0
  );

  const { can } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const quickEdit = useBoolean();

  const preview = useBoolean();

  const { copy } = useCopyToClipboard();

  const details = useBoolean();

  const editDetailsSelected = useBoolean(true);

  const confirm = useBoolean();

  const popover = usePopover();

  const handleClick = useCallback(() => {
    details.onTrue();
  }, [details]);

  const handleCopy = useCallback(() => {
    enqueueSnackbar('Copied!');
    void copy(row.id);
  }, [copy, enqueueSnackbar, row.id]);

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

  const [urlParams] = useState(new URLSearchParams(window.location.search));
  const rowSelected = urlParams.get('selectedVideoId') === row.id ? row : null;

  return (
    <>
      <TableRow
        selected={selected}
        data-cy={`video-${row.id}`}
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
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onDoubleClick={() => console.info('ON DOUBLE CLICK')}
            onClick={onSelectRow}
            data-cy={`raw-video-checkbox-${row.id}`}
          />
        </TableCell>

        <TableCell data-cy={`video-row-name-${title}`}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <RawFileThumbnail file={row.original_file_props as unknown as File} />

            <Stack direction="column" alignContent="baseline">
              <Typography
                onClick={handleClick}
                variant="inherit"
                sx={{
                  cursor: 'pointer',
                  ...(details.value && { fontWeight: 'fontWeightBold' }),
                  wordBreak: 'break-all',
                }}
              >
                {title}
              </Typography>

              <Stack
                direction="row"
                alignItems="start"
                spacing={0.5}
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
                {can(PermissionSlug['preview-raw-videos']) && (
                  <Button
                    onClick={preview.onTrue}
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
                      data-cy={`raw-video-preview-${row.id}`}
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
                )}

                {can(PermissionSlug['edit-raw-videos']) && (
                  <Button
                    onClick={quickEdit.onTrue}
                    sx={{
                      pt: 0,
                      px: 0,
                      mt: 1,
                      cursor: 'default',
                      width: '75px',
                      minWidth: 0,
                    }}
                  >
                    <Chip
                      data-cy={`raw-video-quick-edit-${row.id}`}
                      size="small"
                      variant="outlined"
                      label="Editar"
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
                          icon="solar:pen-bold"
                          sx={{
                            color: 'gray',
                            width: 13,
                            height: 'auto',
                          }}
                        />
                      }
                    />
                  </Button>
                )}
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
                  sx={{ color: 'primary.main', width: '15px', mr: 0.5 }}
                />
              </Tooltip>
              <Typography variant="inherit">{contentStatusTranslation[status]}</Typography>
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>

      <RawContentQuickEditForm
        currentContent={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onChange={mutate}
      />

      <VideoPreview currentContent={row} open={preview.value} onClose={preview.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            handleCopy();
          }}
        >
          <Iconify icon="eva:link-2-fill" />
          Copiar ID
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {can(PermissionSlug['delete-raw-videos']) && (
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
        )}
      </CustomPopover>

      {can(PermissionSlug['edit-raw-videos']) && rowSelected && editDetailsSelected.value && (
        <RawContentFileDetails
          rowId={rowSelected.id}
          item={rowSelected}
          video={rowSelected as unknown as IVideo}
          key={rowSelected.id}
          open={editDetailsSelected.value}
          onClose={editDetailsSelected.onFalse}
          mutate={mutate}
          time={duration}
        />
      )}

      {details.value && (
        <RawContentFileDetails
          rowId={row.id}
          item={row}
          video={row as unknown as IVideo}
          key={row.id}
          open={details.value}
          onClose={details.onFalse}
          mutate={mutate}
          category={categoryPath(row.category)}
          time={duration}
        />
      )}
    </>
  );
}
