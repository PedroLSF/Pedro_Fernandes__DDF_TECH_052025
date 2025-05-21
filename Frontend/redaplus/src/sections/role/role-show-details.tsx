import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fDate, fTime } from 'src/utils/format-time';

import { IRole } from 'src/types/role';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentRole?: IRole;
};

export default function RoleShowDetails({ currentRole, open, onClose }: Props) {
  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 820 },
      }}
    >
      <Card>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            px: 5,
            my: 1,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {[
            {
              value: 'general',
              label: 'Detalhes',
              dataCy: 'role-details-detalhes',
            },
          ].map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} data-cy={tab.dataCy} />
          ))}
        </Tabs>
      </Card>

      {currentTab === 'general' && (
        <DialogContent
          sx={{
            py: 2,
            px: 5,
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            },
          }}
        >
          <Box px={1}>
            <Typography sx={{ fontWeight: 'bold' }} data-cy="role-details-title-name">
              Nome:
            </Typography>
            <Box data-cy="role-details-name">{currentRole?.name ?? '-'}</Box>
          </Box>

          <Box px={1}>
            <Typography sx={{ fontWeight: 'bold' }} data-cy="role-details-title-description">
              Descrição:
            </Typography>
            <Box data-cy="role-details-description">{currentRole?.description ?? '-'}</Box>
          </Box>

          <Box px={1}>
            <Typography sx={{ fontWeight: 'bold' }} data-cy="role-details-title-active">
              Situação:
            </Typography>
            <Box data-cy="role-details-active">{currentRole?.active ? 'Ativo' : 'Inativo'}</Box>
          </Box>

          <Box px={1}>
            <Typography sx={{ fontWeight: 'bold' }} data-cy="role-details-title-admin">
              Admin:
            </Typography>
            <Box data-cy="role-details-admin">{currentRole?.is_admin ? 'Ativo' : 'Inativo'}</Box>
          </Box>

          <Box px={1}>
            <Typography sx={{ fontWeight: 'bold' }} data-cy="role-details-title-createdAt">
              Data de criação:
            </Typography>
            <Box data-cy="role-details-createdAt">
              {fDate(currentRole?.created_at)} - {fTime(currentRole?.created_at)}
            </Box>
          </Box>
        </DialogContent>
      )}

      <DialogActions>
        <Button variant="outlined" onClick={onClose} data-cy="role-details-button">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
