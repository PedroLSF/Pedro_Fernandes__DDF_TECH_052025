import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { PermissionSlug } from 'src/types/role';
import { IChannel, getChannelLabel } from 'src/types/channel';

import { fDate, fTime } from '../../utils/format-time';
import ChannelShowDetails from './channel-show-details';
import ChannelQuickEditForm from './channel-quick-edit-form';
import ChannelThumbnailTableRow from './channel-thumbnail-table-row';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  onProfileRow: VoidFunction;
  row: IChannel;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  mutate: VoidFunction;
  onAddVideoRow: VoidFunction;
  onCreatePlaylistRow: VoidFunction;
};

export default function ChannelTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  mutate,
  onProfileRow,
  onAddVideoRow,
  onCreatePlaylistRow,
}: Props) {
  const { name, type, active, _count, created_at, updated_at } = row;

  const confirm = useBoolean();

  const { can } = useAuthContext();

  const quickEdit = useBoolean();

  const showDetails = useBoolean();

  const popover = usePopover();

  // @ts-ignore
  const canShowDeleteButton = _count?.videoChannels > 0;

  return (
    <>
      <TableRow hover selected={selected} data-cy={`channel-row-${row.id}`}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            data-cy={`channel-checkbox-${row.name}`}
          />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ p: 0 }}>
              <ChannelThumbnailTableRow item={row} />
            </Box>

            <Stack direction="column" alignContent="baseline" onClick={onProfileRow}>
              <Typography variant="inherit" sx={{ cursor: 'pointer' }}>
                {name}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={getChannelLabel(type)}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
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

        <TableCell>
          <ListItemText
            primary={_count?.videoChannels}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={_count?.playlist}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={fDate(created_at)}
            secondary={fTime(created_at)}
            primaryTypographyProps={{
              typography: 'body2',
            }}
            secondaryTypographyProps={{
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={fDate(updated_at)}
            secondary={fTime(updated_at)}
            primaryTypographyProps={{
              typography: 'body2',
            }}
            secondaryTypographyProps={{
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {can(PermissionSlug['edit-playlists']) && (
            <Tooltip title="Criar Playlist" placement="top" arrow>
              <IconButton
                color="inherit"
                onClick={onCreatePlaylistRow}
                data-cy={`playlist-add-video-edit-${row.name}`}
              >
                <Iconify icon="material-symbols-light:playlist-add" />
              </IconButton>
            </Tooltip>
          )}

          {can(PermissionSlug['edit-channels']) && (
            <Tooltip title="Adicionar vídeos" placement="top" arrow>
              <IconButton
                color="inherit"
                onClick={onAddVideoRow}
                data-cy={`channel-add-video-edit-${row.name}`}
              >
                <Iconify icon="fluent:video-add-20-regular" />
              </IconButton>
            </Tooltip>
          )}

          {can(PermissionSlug['edit-channels']) && (
            <Tooltip title="Edição rápida" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
                data-cy={`channel-quick-edit-${row.name}`}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Visualizar detalhes" placement="top" arrow>
            <IconButton
              color={showDetails.value ? 'inherit' : 'default'}
              onClick={showDetails.onTrue}
              data-cy={`channel-show-details-${row.name}`}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          {can(PermissionSlug['edit-channels']) && (
            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={popover.onOpen}
              data-cy={`channel-options-${row.name}`}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <ChannelQuickEditForm
        onChange={mutate}
        currentChannel={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />

      <ChannelShowDetails
        currentChannel={row}
        open={showDetails.value}
        onClose={showDetails.onFalse}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 180 }}
      >
        {can(PermissionSlug['delete-channels']) && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
            data-cy={`channel-option-delete-${row.name}`}
            disabled={canShowDeleteButton}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Excluir
          </MenuItem>
        )}

        {can(PermissionSlug['edit-channels']) && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
            data-cy={`channel-option-edit-${row.name}`}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        )}
        {can(PermissionSlug['view-profile-channels']) && (
          <MenuItem
            onClick={() => {
              onProfileRow();
              popover.onClose();
            }}
            data-cy={`channel-option-perfil-${row.name}`}
          >
            <Iconify icon="lucide:view" />
            Perfil do canal
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir canal"
        content="Tem certeza que deseja excluir?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow} data-cy="confirm-delete">
            Excluir
          </Button>
        }
      />
    </>
  );
}
