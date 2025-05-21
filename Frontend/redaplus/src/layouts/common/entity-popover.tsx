import { m } from 'framer-motion';
import { useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import Iconify from '../../components/iconify';
import { ICategory } from '../../types/category';
import { useAuthContext } from '../../auth/hooks';

// ----------------------------------------------------------------------

export default function EntityPopover() {
  const popover = usePopover();

  const { currentEntity, user, setCurrentEntity, CanRequest } = useAuthContext();

  const { allowed_categories } = user ?? {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ac = allowed_categories ?? [];

  const handleChangeCurrentEntity = useCallback(
    (entity: Partial<ICategory> | null) => {
      setCurrentEntity(entity);
      popover.onClose();
    },
    // eslint-disable-next-line
    [setCurrentEntity]
  );

  useEffect(() => {
    if (ac.length === 1 && !currentEntity) {
      handleChangeCurrentEntity(ac[0]);
    }
  }, [ac, currentEntity, handleChangeCurrentEntity]);

  return (
    <>
      <Button
        data-cy="entity-button"
        variant="text"
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        startIcon={<Iconify icon="streamline:cyborg-2-solid" color="orange" />}
        sx={{
          px: 2,
          height: 40,
          ...(popover.open && {
            bgcolor: 'action.selected',
          }),
        }}
      >
        {currentEntity?.name ?? 'Todas'}
      </Button>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 160 }}>
        {ac.length > 1 && (
          <MenuItem
            key="all"
            selected={currentEntity === null}
            onClick={() => {
              handleChangeCurrentEntity(null);
              CanRequest();
            }}
          >
            Todos
          </MenuItem>
        )}
        {ac.map((entity) => (
          <MenuItem
            data-cy={`entity-${entity.name}`}
            key={entity.id}
            selected={entity.id === currentEntity?.id}
            onClick={() => {
              handleChangeCurrentEntity(entity);
              CanRequest();
            }}
          >
            {entity.name}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
