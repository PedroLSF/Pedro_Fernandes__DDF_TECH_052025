import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fDate, fTime } from 'src/utils/format-time';

import { IUserItem } from 'src/types/user';
// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser?: IUserItem;
};

export default function UserShowDetails({ currentUser, open, onClose }: Props) {
  const [currentTab, setCurrentTab] = useState('general');

  const entities = currentUser?.categoryUsers?.map((categoryUser) => categoryUser?.category?.name);

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
        sx: { maxWidth: 720 },
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
            },
          ].map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              data-cy={`user-show-details-${tab.value}`}
            />
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
            <Avatar
              data-cy="user-show-details-avatar"
              alt={currentUser?.name}
              src={currentUser?.avatar ? currentUser?.avatar : currentUser?.name}
              sx={{ p: 3 }}
            />
          </Box>
          <Box />

          <Box px={1}>
            <Typography data-cy="user-show-details-label-name" sx={{ fontWeight: 'bold' }}>
              Nome:
            </Typography>
            <Box data-cy="user-show-details-value-name">{currentUser?.name}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-show-details-label-email" sx={{ fontWeight: 'bold' }}>
              E-mail:
            </Typography>
            <Box data-cy="user-show-details-value-email">{currentUser?.email}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-show-details-label-phone" sx={{ fontWeight: 'bold' }}>
              Numero de telefone:
            </Typography>
            <Box data-cy="user-show-details-value-phone">{currentUser?.phone}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-show-details-label-active" sx={{ fontWeight: 'bold' }}>
              Situação:
            </Typography>
            <Box data-cy="user-show-details-value-active">
              {currentUser?.active ? 'Ativo' : 'Inativo'}
            </Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-show-details-label-biography" sx={{ fontWeight: 'bold' }}>
              Mini Bio:
            </Typography>
            <Box data-cy="user-show-details-value-biography">{currentUser?.biography ?? '-'}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-show-details-label-created-at" sx={{ fontWeight: 'bold' }}>
              Data de criação:
            </Typography>
            <Box data-cy="user-show-details-value-created-at">
              {fDate(currentUser?.created_at)} - {fTime(currentUser?.created_at)}
            </Box>
          </Box>
        </DialogContent>
      )}

      <DialogActions>
        <Button variant="outlined" onClick={onClose} data-cy="user-show-details-close-button">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
