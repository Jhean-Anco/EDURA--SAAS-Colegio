'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Aside } from './aside';
import { TopBar } from './topbar';
import { Breadcrumb } from './breadcrumb';
import { Button } from '@/components/ui/button';
import type { SesionCliente } from '@/types/auth';
import type { NavGroup } from '@/types/navegacion';

const STORAGE_KEY = 'edura_aside_colapsado';

interface ShellProps {
  readonly sesion: SesionCliente;
  readonly grupos: NavGroup[];
  readonly children: React.ReactNode;
}

export function Shell({ sesion, grupos, children }: ShellProps): React.JSX.Element {
  const [colapsado, setColapsado] = useState(false);
  const [montado, setMontado] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado === 'true') setColapsado(true);
    setMontado(true);
  }, []);

  // Cerrar drawer con Escape
  useEffect(() => {
    if (!drawerAbierto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerAbierto(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerAbierto]);

  const toggleAside = () => {
    setColapsado((prev) => {
      const siguiente = !prev;
      localStorage.setItem(STORAGE_KEY, String(siguiente));
      return siguiente;
    });
  };

  if (!montado) return <div className="h-screen bg-[--color-surface]" />;

  return (
    <>
      {/* Skip link */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[--color-brand-600] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Ir al contenido principal
      </a>

      <div className="flex h-screen overflow-hidden bg-[--color-surface-subtle]">
        {/* Sidebar escritorio */}
        <div className="hidden lg:flex">
          <Aside grupos={grupos} colapsado={colapsado} />
        </div>

        {/* Drawer móvil — overlay */}
        {drawerAbierto && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            aria-hidden="true"
            onClick={() => setDrawerAbierto(false)}
          >
            <div className="absolute inset-0 bg-black/50 motion-safe:animate-in motion-safe:fade-in" />
          </div>
        )}

        {/* Drawer móvil — panel */}
        <dialog
          ref={drawerRef}
          open={drawerAbierto}
          aria-label="Menú de navegación"
          className={cn(
            'fixed inset-y-0 left-0 z-50 m-0 h-full w-64 border-0 p-0 lg:hidden',
            'transition-transform duration-200',
            drawerAbierto ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="relative flex h-full flex-col bg-[--color-surface] shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setDrawerAbierto(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
            <Aside grupos={grupos} colapsado={false} />
          </div>
        </dialog>

        {/* Contenido principal */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            sesion={sesion}
            onToggleAside={() => {
              if (window.innerWidth >= 1024) {
                toggleAside();
              } else {
                setDrawerAbierto((prev) => !prev);
              }
            }}
          />

          <main
            id="contenido-principal"
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            tabIndex={-1}
          >
            <div className="mx-auto max-w-6xl space-y-6">
              <Breadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
