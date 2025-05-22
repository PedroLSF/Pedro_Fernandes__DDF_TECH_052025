import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { Stack, Button, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { AuthUserType } from 'src/auth/types';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IEssayItem, stateIcons, essayStatusTranslation } from 'src/types/essay';

import { fDate, fTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  user: AuthUserType;
  onEditRow: VoidFunction;
  row: IEssayItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function EssayTableRow({
  row,
  user,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  // onDeleteRow,
}: Props) {
  const { title, theme, status, created_at } = row;

  const quickEdit = useBoolean();
  const popover = usePopover();
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected} data-cy={`user-row-${title}`}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} data-cy={`user-checkbox-${title}`} />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={title}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={theme}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="Situação do encoding do arquivo" placement="top">
              <Iconify
                icon={stateIcons[status]}
                sx={{
                  color: 'primary.main',
                  width: '15px',
                  mr: 0.5,
                }}
              />
            </Tooltip>
            <Typography variant="inherit">{essayStatusTranslation[status]}</Typography>
          </Stack>
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
          <Tooltip title="Editar" placement="top" arrow>
            <IconButton
              data-cy={`user-pencil-${title}`}
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={onEditRow}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir Redação" placement="top" arrow>
            <IconButton
              color="error"
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              data-cy={`user-eye-${title}`}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {user && user.is_master && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            data-cy="delete-row"
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Excluir
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir redação"
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
