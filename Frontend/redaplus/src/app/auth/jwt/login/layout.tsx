'use client';

import React from 'react';

import { useTheme } from '@mui/material/styles';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return (
    <GuestGuard>
      <AuthClassicLayout title="Olá, seja bem-vindo!">{children}</AuthClassicLayout>
    </GuestGuard>
  );
}
