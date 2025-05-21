'use client';

import React from 'react';

import CompactLayout from 'src/layouts/compact';

import { SnackbarProvider } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <CompactLayout>
      <SnackbarProvider>{children}</SnackbarProvider>
    </CompactLayout>
  );
}
