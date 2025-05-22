'use client';

import * as React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography/Typography';

import { useAuthContext } from 'src/auth/hooks';

import { useSettingsContext } from 'src/components/settings';

export default function WelcomeView() {
  const settings = useSettingsContext();
  const { user } = useAuthContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Box display="flex" justifyContent="center">
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 1, mt: 9 }}>
          {`Olá! Bem-vindo(a) de volta, ${user?.name} 👋`}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center">
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 8 }}>
          Clique no menu ao lado para acessar as funcionalidades do RedaPlus
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center">
        <Box
          component="img"
          alt="auth"
          src="/logo/welcome-image.png"
          sx={{
            maxWidth: {
              xs: 480,
              lg: 560,
            },
            width: {
              xl: 420,
            },
          }}
        />
      </Box>
    </Container>
  );
}
