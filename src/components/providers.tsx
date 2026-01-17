'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './ui/toast';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
};
