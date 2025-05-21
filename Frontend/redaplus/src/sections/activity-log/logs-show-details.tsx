import React, { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { fDate, fTime } from '../../utils/format-time';
import { ILogs, resource_type, actionTranslation } from '../../types/logs';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentLog?: ILogs;
};

export default function LogsShowDetails({ currentLog, open, onClose }: Props) {
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
        sx: { maxWidth: 1300 },
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
            <Tab data-cy={`tab-${tab.label}`} key={tab.value} value={tab.value} label={tab.label} />
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
            <Typography data-cy="user-details-view-name" sx={{ fontWeight: 'bold' }}>
              Usuário:
            </Typography>
            <Box>{currentLog?.user?.name}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-details-view-email" sx={{ fontWeight: 'bold' }}>
              Email:
            </Typography>
            <Box>{currentLog?.user?.email}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-details-view-action" sx={{ fontWeight: 'bold' }}>
              Ação:
            </Typography>
            <Box>{actionTranslation[currentLog?.action as keyof typeof actionTranslation]}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-details-view-resource-type" sx={{ fontWeight: 'bold' }}>
              Entidade alvo:
            </Typography>
            <Box>{resource_type[currentLog?.resource_type as keyof typeof resource_type]}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-details-view-description" sx={{ fontWeight: 'bold' }}>
              Descrição:
            </Typography>
            <Box>{currentLog?.description ?? ''}</Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-details-view-created-at" sx={{ fontWeight: 'bold' }}>
              Data de criação:
            </Typography>
            <Box>
              {fDate(currentLog?.created_at)} - {fTime(currentLog?.created_at)}
            </Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-details-view-input" sx={{ fontWeight: 'bold' }}>
              Entrada:
            </Typography>
            <Box>
              <pre>{JSON.stringify(currentLog?.input, null, 2)}</pre>
            </Box>
          </Box>

          <Box px={1}>
            <Typography data-cy="user-details-view-output" sx={{ fontWeight: 'bold' }}>
              Saida:
            </Typography>
            <Box>
              <pre>{JSON.stringify(currentLog?.output, null, 2)}</pre>
            </Box>
          </Box>
        </DialogContent>
      )}

      <DialogActions>
        <Button data-cy="logs-close-details-button" variant="outlined" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
