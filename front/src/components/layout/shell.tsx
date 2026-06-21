'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Aside } from './aside';
import { TopBar } from './topbar';
import { Breadcrumb } from './breadcrumb';
import type { SesionCliente } from '@/types/auth';
import type { NavItem } from '@/types/navegacion';

const STORAGE_KEY = 'edura_aside_colapsado';

interface ShellProps {
  sesion: SesionCliente;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function Shell({ sesion, navItems, children }: ShellProps): React.JSX.Element {
  const [colapsado, setColapsado] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado === 'true') setColapsado(true);
    setMontado(true);
  }, []);

  const toggleAside = () => {
    setColapsado((prev) => {
      const siguiente = !prev;
      localStorage.setItem(STORAGE_KEY, String(siguiente));
      return siguiente;
    });
  };

  if (!montado) return <div className="h-screen bg-[--color-surface]" />;

  return (
    <div className="flex h-screen overflow-hidden bg-[--color-surface-subtle]">
      <Aside items={navItems} colapsado={colapsado} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar sesion={sesion} onToggleAside={toggleAside} />

        <main className="flex-1 overflow-y-auto p-6">
          <div
            className={cn(
              'mx-auto max-w-6xl space-y-6',
            )}
          >
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
