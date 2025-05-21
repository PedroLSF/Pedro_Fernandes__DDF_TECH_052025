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

import { ICategory } from 'src/types/category';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentCategory?: ICategory;
};

export default function CategoryShowDetails({ currentCategory, open, onClose }: Props) {
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
              dataCy: 'detalhes-tag',
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
            <Typography sx={{ fontWeight: 'bold' }}>Nome:</Typography>
            <Box>{currentCategory?.name ?? '-'}</Box>
          </Box>

          <Box px={1}>
            <Typography sx={{ fontWeight: 'bold' }}>Situação:</Typography>
            <Box>{currentCategory?.active ? 'Ativo' : 'Inativo'}</Box>
          </Box>

          <Box px={1}>
            <Typography sx={{ fontWeight: 'bold' }}>Data de criação:</Typography>
            <Box>
              {fDate(currentCategory?.created_at)} - {fTime(currentCategory?.created_at)}
            </Box>
          </Box>
        </DialogContent>
      )}

      <DialogActions>
        <Button variant="outlined" onClick={onClose} data-cy="close-button-show-details">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
