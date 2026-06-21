'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { REGISTRO_NAVEGACION } from '@/lib/navegacion/registro';

export function Breadcrumb(): React.JSX.Element {
  const pathname = usePathname();

  const item = REGISTRO_NAVEGACION.find(
    (n) => pathname === n.ruta || pathname.startsWith(`${n.ruta}/`),
  );

  return (
    <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-sm text-[--color-text-secondary]">
      <Link href="/panel" className="flex items-center hover:text-[--color-text-primary]">
        <Home className="h-4 w-4" aria-hidden />
        <span className="sr-only">Panel</span>
      </Link>
      {item && item.ruta !== '/panel' && (
        <>
          <ChevronRight className="h-4 w-4 text-[--color-text-muted]" aria-hidden />
          <span className="font-medium text-[--color-text-primary]">{item.etiqueta}</span>
        </>
      )}
    </nav>
  );
}
