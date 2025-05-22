'use client';

import React from 'react';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

import { SnackbarProvider } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <SnackbarProvider>
        <AuthClassicLayout title="Esqueceu sua senha?">{children}</AuthClassicLayout>
      </SnackbarProvider>
    </GuestGuard>
  );
}
