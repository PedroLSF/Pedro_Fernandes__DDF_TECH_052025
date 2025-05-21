import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import Iconify from '../../components/iconify';
import LogsShowDetails from './logs-show-details';
import { useBoolean } from '../../hooks/use-boolean';
import { fDate, fTime } from '../../utils/format-time';
import { ILogs, actionTranslation } from '../../types/logs';

type Props = {
  selected: boolean;
  row: ILogs;
  onSelectRow: VoidFunction;
};

export default function LogsTableRow({ row, selected, onSelectRow }: Props) {
  const { user, action, description, created_at } = row;

  const showDetails = useBoolean();

  const defaultValues = useMemo(
    () => ({
      active: action || false,
    }),
    [action]
  );
  useForm({
    defaultValues,
  });

  return (
    <>
      <TableRow hover selected={selected} data-cy={`logs-row-${row.id}`}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            data-cy={`activity-logs-checkbox-${row.id}`}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={user?.name}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={user?.email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={actionTranslation[action]}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={description}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
            data-cy={`activity-logs-description-${row.id}`}
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
          <Tooltip title="Visualizar detalhes" placement="top" arrow>
            <IconButton
              color={showDetails.value ? 'inherit' : 'default'}
              onClick={async () => {
                showDetails.onTrue();
              }}
              data-cy={`activity-logs-eye-${row.id}`}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <LogsShowDetails currentLog={row} open={showDetails.value} onClose={showDetails.onFalse} />
    </>
  );
}
