import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { ITagItem } from 'src/types/tag';
import { PermissionSlug } from 'src/types/role';

import TagShowDetails from './tag-show-details';
import TagQuickEditForm from './tag-quick-edit-form';
import { fDate, fTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ITagItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  mutate: VoidFunction;
};

export default function TagTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  mutate,
}: Props) {
  const { name, active, created_at } = row;

  const confirm = useBoolean();

  const { can } = useAuthContext();

  const quickEdit = useBoolean();

  const showDetails = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected} data-cy={`tag-row-${row.id}`}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} data-cy={`tag-checkbox-${row.id}`} />
        </TableCell>

        <TableCell data-cy="tag-label-name">
          <Label variant="soft" sx={{ bgcolor: `${row?.color}` }}>
            <ListItemText
              primary={name}
              primaryTypographyProps={{
                variant: 'body2',
                style: { color: 'black', fontWeight: 'bold' },
              }}
              secondaryTypographyProps={{
                component: 'span',
                color: 'text.disabled',
              }}
            />
          </Label>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={active ? 'Ativo' : 'Inativo'}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
            data-cy="tag-row-active"
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

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {can(PermissionSlug['edit-tags']) && (
            <Tooltip title="Edição Rápida" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={async () => {
                  await mutate();
                  quickEdit.onTrue();
                }}
                data-cy={`tag-pencil-${row.id}`}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Visualizar detalhes" placement="top" arrow>
            <IconButton
              color={showDetails.value ? 'inherit' : 'default'}
              onClick={async () => {
                await mutate();
                showDetails.onTrue();
              }}
              data-cy={`tag-eye-${row.id}`}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          {can(PermissionSlug['edit-tags']) && (
            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={popover.onOpen}
              data-cy={`tag-options-${row.id}`}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <TagQuickEditForm
        currentTag={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        mutate={mutate}
      />

      <TagShowDetails currentTag={row} open={showDetails.value} onClose={showDetails.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {can(PermissionSlug['delete-tags']) && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
            data-cy={`tag-delete-${row.id}`}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Excluir
          </MenuItem>
        )}
        {can(PermissionSlug['edit-tags']) && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
            data-cy={`tag-edit-${row.id}`}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir Tag"
        content="Tem certeza que deseja excluir a tag?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow} data-cy="tag-delete">
            Excluir
          </Button>
        }
      />
    </>
  );
}
