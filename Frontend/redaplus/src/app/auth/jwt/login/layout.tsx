'use client';

import React from 'react';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <AuthClassicLayout title="Olá, seja bem-vindo!">{children}</AuthClassicLayout>
    </GuestGuard>
  );
}
