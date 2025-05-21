'use client';

import React from 'react';

import { useTheme } from '@mui/material/styles';

import AuthClassicLayout from 'src/layouts/auth/classic';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  return <AuthClassicLayout title=" ">{children}</AuthClassicLayout>;
}
