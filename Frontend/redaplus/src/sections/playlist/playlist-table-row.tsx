import React, { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Chip, Tooltip } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import Iconify from '../../components/iconify';
import PlaylistPreview from './playlist-preview';
import { useAuthContext } from '../../auth/hooks';
import { PermissionSlug } from '../../types/role';
import { useBoolean } from '../../hooks/use-boolean';
import { IPlaylistItem } from '../../types/playlist';
import { fDate, fTime } from '../../utils/format-time';
import PlaylistCopyDialog from './playlist-copy-dialog';
import PlaylistEmbedDialog from './playlist-embed-dialog';
import PlaylistDownloadCsv from './playlist-download-csv';
import { ConfirmDialog } from '../../components/custom-dialog';

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IPlaylistItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function PlaylistTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const { name, _count, created_at, updated_at, active } = row;

  const confirm = useBoolean();

  const { can } = useAuthContext();

  const canShowDeleteButton = _count.videoPlaylist !== 0;
  const embedDetails = useBoolean();
  const details = useBoolean();
  const preview = useBoolean();
  const downloadCSV = useBoolean();
  const copyPlaylist = useBoolean();

  const handleEmbedDetails = useCallback(() => {
    embedDetails.onTrue();

    setTimeout(() => {
      details.onFalse();
    }, 50);
  }, [embedDetails, details]);

  return (
    <>
      <TableRow hover selected={selected} data-cy={`playlist-row-${row.id}`}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            data-cy={`playlist-checkbox-${row.id}`}
          />
        </TableCell>

        <TableCell>
          <Stack direction="column" alignItems="flex-start" spacing={1} sx={{ marginTop: '8px' }}>
            <Stack onClick={onEditRow}>
              <ListItemText
                primary={name}
                primaryTypographyProps={{ typography: 'body2' }}
                secondaryTypographyProps={{
                  component: 'span',
                  color: 'text.disabled',
                }}
                sx={{ cursor: 'pointer' }}
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={handleEmbedDetails}
                sx={{
                  p: 0,
                  minWidth: 0,
                  alignSelf: 'flex-start',
                }}
              >
                <Chip
                  data-cy={`playlist-view-embed-${row.id}`}
                  size="small"
                  variant="outlined"
                  label="Embed"
                  sx={{
                    border: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  icon={
                    <Iconify
                      icon="solar:wad-of-money-bold"
                      color="gray"
                      sx={{ width: 13, height: 'auto' }}
                    />
                  }
                />
              </Button>
              <Button
                onClick={preview.onTrue}
                sx={{
                  p: 0,
                  minWidth: 0,
                  alignSelf: 'flex-start',
                }}
              >
                <Chip
                  data-cy={`playlist-preview-${row.id}`}
                  size="small"
                  variant="outlined"
                  label="Prévia"
                  sx={{
                    border: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
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
              <Button
                onClick={downloadCSV.onTrue}
                sx={{
                  p: 0,
                  minWidth: 0,
                  alignSelf: 'flex-start',
                }}
              >
                <Chip
                  data-cy={`playlist-download-csv-${row.id}`}
                  size="small"
                  variant="outlined"
                  label="Baixar CSV"
                  sx={{
                    border: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  icon={
                    <Iconify
                      icon="tabler:file-download"
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
            </Stack>
          </Stack>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={_count.videoPlaylist}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
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
                {fDate(created_at)} {fTime(created_at)}
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

        <TableCell>
          <ListItemText
            primary={active ? 'Ativo' : 'Inativo'}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {can(PermissionSlug['add-playlists']) && (
            <Tooltip title="Copiar playlist" placement="top" arrow>
              <IconButton onClick={copyPlaylist.onTrue} data-cy={`copy-playlist-${row.id}`}>
                <Iconify icon="eva:copy-fill" />
              </IconButton>
            </Tooltip>
          )}
          {can(PermissionSlug['delete-playlists']) && (
            <IconButton
              disabled={canShowDeleteButton}
              color="error"
              onClick={confirm.onTrue}
              data-cy={`playlist-trash-${name}`}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir playlist"
        content="Tem certeza que deseja excluir?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow} data-cy="confirm-delete">
            Excluir
          </Button>
        }
      />

      {embedDetails.value && (
        <PlaylistEmbedDialog
          currentPlaylist={row}
          open={embedDetails.value}
          onClose={embedDetails.onFalse}
        />
      )}

      {preview.value && (
        <PlaylistPreview currentPlaylist={row} open={preview.value} onClose={preview.onFalse} />
      )}

      {downloadCSV.value && (
        <PlaylistDownloadCsv
          playlistId={row.id}
          playlistName={row.name}
          onClose={downloadCSV.onFalse}
        />
      )}

      {copyPlaylist.value && (
        <PlaylistCopyDialog
          currentPlaylist={row}
          open={copyPlaylist.value}
          onClose={copyPlaylist.onFalse}
        />
      )}
    </>
  );
}
