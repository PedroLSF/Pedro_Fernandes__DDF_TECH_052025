import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { categoryPath } from 'src/utils/categoryPath';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { ICategory } from 'src/types/category';
import { PermissionSlug } from 'src/types/role';

import { fDate, fTime } from '../../utils/format-time';
import CategoryShowDetails from './category-show-details';
import CategoryQuickEditForm from './category-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: ICategory;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  mutate: VoidFunction;
};

export default function CategoryTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  mutate,
}: Props) {
  const { name, active, created_at, _count } = row;
  const canShowDeleteButton = Boolean(_count?.videos === 0 && _count?.children === 0);

  const confirm = useBoolean();

  const { can } = useAuthContext();

  const quickEdit = useBoolean();

  const showDetails = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected} data-cy={`category-row-${row.id}`}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            data-cy={`category-checkbox-${name}`}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={`${name} ${(_count && `(${_count?.videos})`) ?? ''}`}
            secondary={
              <Stack
                direction="row"
                alignItems="center"
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
                {categoryPath(row)}
              </Stack>
            }
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
            data-cy={`category-name-${name}`}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={row.id}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
            data-cy={`category-status-${name}`}
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
            data-cy={`category-status-${name}`}
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
            data-cy={`category-createdAt-${name}`}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {can(PermissionSlug['edit-categories']) && (
            <Tooltip title="Edição rápida" placement="top" arrow>
              <IconButton
                color={quickEdit.value ? 'inherit' : 'default'}
                onClick={quickEdit.onTrue}
              >
                <Iconify icon="solar:pen-bold" data-cy={`category-quick-edit-button-${name}`} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Visualizar detalhes" placement="top" arrow>
            <IconButton
              color={showDetails.value ? 'inherit' : 'default'}
              onClick={showDetails.onTrue}
            >
              <Iconify icon="solar:eye-bold" data-cy={`category-show-details-button-${name}`} />
            </IconButton>
          </Tooltip>

          {can(PermissionSlug['edit-categories']) && (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" data-cy={`category-options-button-${name}`} />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      <CategoryQuickEditForm
        onChange={mutate}
        currentCategory={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />

      <CategoryShowDetails
        currentCategory={row}
        open={showDetails.value}
        onClose={showDetails.onFalse}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {can(PermissionSlug['delete-categories']) && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            data-cy="delete-row"
            sx={{ color: 'error.main' }}
            disabled={!canShowDeleteButton}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Excluir
          </MenuItem>
        )}

        {can(PermissionSlug['edit-categories']) && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
            data-cy="editar-row"
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir categoria"
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
