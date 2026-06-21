'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={(theme as 'light' | 'dark' | 'system') ?? 'system'}
      position="bottom-right"
      richColors
      closeButton
    />
  );
}
