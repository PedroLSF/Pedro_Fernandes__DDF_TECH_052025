'use client';

import React from 'react';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { SnackbarProvider } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <SnackbarProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SnackbarProvider>
    </AuthGuard>
  );
}
