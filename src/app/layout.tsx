import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Build Together Protocol',
  description: 'Experiment-driven collaboration without chaos.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
