'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';
import type { NavGroup } from '@/types/navegacion';

interface AsideProps {
  grupos: NavGroup[];
  colapsado: boolean;
}

export function Aside({ grupos, colapsado }: AsideProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[--color-border] bg-[--color-surface] transition-all duration-200',
        colapsado ? 'w-[--aside-collapsed-width]' : 'w-[--aside-width]',
      )}
      aria-label="Menú principal"
    >
      <div className="flex h-[--topbar-height] items-center px-3 border-b border-[--color-border]">
        {colapsado ? (
          <Logo variant="icono" className="h-7 w-7" />
        ) : (
          <Logo variant="completo" className="h-7" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2" aria-label="Navegación principal">
        {grupos.map((grupo, gi) => (
          <div key={gi} className="mb-1">
            {!colapsado && grupo.etiqueta && (
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[--color-text-tertiary]">
                {grupo.etiqueta}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {grupo.items.map((item) => {
                const activo =
                  pathname === item.ruta || pathname.startsWith(`${item.ruta}/`);
                const Icono = item.icono;
                return (
                  <li key={item.codigo}>
                    <Link
                      href={item.ruta}
                      aria-current={activo ? 'page' : undefined}
                      title={colapsado ? item.etiqueta : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-500]',
                        activo
                          ? 'bg-[--color-brand-50] text-[--color-brand-700] dark:bg-[--color-brand-900]/20 dark:text-[--color-brand-200]'
                          : 'text-[--color-text-secondary] hover:bg-[--color-surface-muted] hover:text-[--color-text-primary]',
                        colapsado && 'justify-center px-2',
                      )}
                    >
                      <Icono className="h-4 w-4 shrink-0" aria-hidden />
                      {!colapsado && <span className="truncate">{item.etiqueta}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
