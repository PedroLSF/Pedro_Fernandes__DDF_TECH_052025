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

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IRole, PermissionSlug } from 'src/types/role';

import RoleShowDetails from './role-show-details';
import { fDate, fTime } from '../../utils/format-time';
import RoleQuickEditForm from './role-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IRole;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  mutate: VoidFunction;
};

export default function RoleTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  mutate,
}: Props) {
  const { name, active, created_at, _count } = row;

  const { can } = useAuthContext();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const showDetails = useBoolean();

  const popover = usePopover();

  // @ts-ignore
  const canShowDeleteButton = _count?.users > 0;

  return (
    <>
      <TableRow hover selected={selected} data-cy={`role-row-${name}`}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} data-cy={`role-checkbox-${name}`} />
        </TableCell>

        <TableCell data-cy="role-label-name">
          <ListItemText
            primary={name}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
            data-cy={`role-active-${name}`}
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
          {can(PermissionSlug['edit-roles']) && (
            <Tooltip title="Edição rápida" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
                data-cy={`role-pencil-${name}`}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Visualizar detalhes" placement="top" arrow>
            <IconButton
              color={showDetails.value ? 'inherit' : 'default'}
              onClick={showDetails.onTrue}
              data-cy={`role-eye-${name}`}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
            data-cy={`role-options-${name}`}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <RoleQuickEditForm
        onChange={mutate}
        currentRole={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />

      <RoleShowDetails currentRole={row} open={showDetails.value} onClose={showDetails.onFalse} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {can(PermissionSlug['delete-roles']) && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
            data-cy={`role-delete-${name}`}
            disabled={canShowDeleteButton}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Excluir
          </MenuItem>
        )}

        {can(PermissionSlug['delete-roles']) && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
            data-cy={`role-edit-${name}`}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir função"
        content="Tem certeza que deseja excluir?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow} data-cy="role-delete">
            Excluir
          </Button>
        }
      />
    </>
  );
}
