'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
