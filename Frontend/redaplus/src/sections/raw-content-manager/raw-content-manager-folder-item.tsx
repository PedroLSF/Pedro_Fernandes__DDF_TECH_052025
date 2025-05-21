import { enqueueSnackbar } from 'notistack';
import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import { CardProps } from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { fData } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IFolderManager } from 'src/types/file-manager';

import axiosInstance, { endpoints } from '../../utils/axios';
import RawContentManagerFileDetails from './raw-content-manager-file-details';
import RawContentManagerNewFolderDialog from './raw-content-manager-new-folder-dialog';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  folder: IFolderManager;
  selected?: boolean;
  onSelect?: VoidFunction;
  onDelete: VoidFunction;
  mutate: VoidFunction;
}

export default function RawContentManagerFolderItem({
  folder,
  selected,
  onSelect,
  onDelete,
  mutate,
  sx,
  ...other
}: Props) {
  const router = useRouter();

  const [folderName, setFolderName] = useState(folder.name);

  const editFolder = useBoolean();

  const checkbox = useBoolean();

  const popover = usePopover();

  const confirm = useBoolean();

  const details = useBoolean();

  const handleChangeFolderName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  }, []);

  const handleClick = () => {
    router.push(`${window.location.pathname}?node_id=${folder.id}&directories=1`);
  };

  const renderAction = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        right: 8,
        position: 'absolute',
      }}
    >
      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Stack>
  );

  const renderIcon =
    (checkbox.value || selected) && onSelect ? (
      <Checkbox
        size="medium"
        checked={selected}
        onClick={onSelect}
        icon={<Iconify icon="eva:radio-button-off-fill" />}
        checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        sx={{ p: 0.75 }}
      />
    ) : (
      <Box component="img" src="/assets/icons/files/ic_folder.svg" sx={{ width: 36, height: 36 }} />
    );

  const parseSingle = (num: number, suffix: string, plural = '(s)') =>
    num > 1 ? `${num} ${suffix}${plural}` : `${num} ${suffix}`;

  const renderText = (
    <Tooltip
      title={folder.name}
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -30],
            },
          },
        ],
      }}
    >
      <ListItemText
        primary={folder.name}
        data-cy={`folder-${folder.name}`}
        secondary={
          <>
            {fData(folder.size)}
            <Box
              component="span"
              sx={{
                mx: 0.75,
                width: 2,
                height: 2,
                borderRadius: '50%',
                bgcolor: 'currentColor',
              }}
            />

            {folder.totalFolders ? parseSingle(folder.totalFolders, 'diretório') : ''}
            {folder.totalFolders && folder.totalArchives ? ' | ' : ''}
            {folder.totalArchives ? parseSingle(folder.totalArchives, 'arquivo') : ''}
            {(folder.totalFolders || folder.totalArchives) && folder.totalFiles ? ' | ' : ''}
            {folder.totalFiles ? parseSingle(folder.totalFiles, 'vídeo') : ''}
          </>
        }
        primaryTypographyProps={{
          typography: 'subtitle1',
          sx: {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            WebkitLineClamp: 1,
            textOverflow: 'ellipsis',
            width: '100%',
          },
        }}
        secondaryTypographyProps={{
          mt: 0.5,
          component: 'span',
          alignItems: 'center',
          typography: 'caption',
          color: 'text.disabled',
          display: 'inline-flex',
        }}
      />
    </Tooltip>
  );

  return (
    <>
      <Stack
        component={Paper}
        onClick={handleClick}
        variant="outlined"
        spacing={1}
        alignItems="flex-start"
        sx={{
          p: 2.5,
          maxWidth: 222,
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
        <Box
          onMouseEnter={checkbox.onTrue}
          onMouseLeave={checkbox.onFalse}
          onClick={(event) => event.stopPropagation()}
        >
          {renderIcon}
        </Box>

        <Box onClick={(event) => event.stopPropagation()}>{renderAction}</Box>

        {renderText}
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
            editFolder.onTrue();
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
          disabled={folder.parent_id === null}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Excluir
        </MenuItem>
      </CustomPopover>

      <RawContentManagerFileDetails
        item={folder}
        open={details.value}
        onClose={details.onFalse}
        onDelete={() => {
          details.onFalse();
          onDelete();
        }}
      />

      <RawContentManagerNewFolderDialog
        open={editFolder.value}
        onClose={editFolder.onFalse}
        title="Editar Pasta"
        onUpdate={async () => {
          editFolder.onFalse();
          setFolderName(folderName);

          if (!folderName || folderName.trim().length === 0) {
            enqueueSnackbar('Digite o nome do diretório', {
              variant: 'error',
            });
            return;
          }
          try {
            const response = await axiosInstance.put(endpoints.directory.put(folder.id), {
              name: folderName.trim(),
            });
            if ([201, 200].includes(response.status)) {
              enqueueSnackbar('Diretório atualizado com sucesso', {
                variant: 'success',
              });
              mutate();
            }
          } catch (error) {
            enqueueSnackbar('Falha ao atualuzar o diretório', {
              variant: 'error',
            });
            if (error.message) {
              enqueueSnackbar(error.message, {
                variant: 'error',
              });
            }
          }
        }}
        folderName={folderName}
        onChangeFolderName={handleChangeFolderName}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Excluir"
        content="Tem certeza que deseja excluir esse diretório?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Excluir
          </Button>
        }
      />
    </>
  );
}
