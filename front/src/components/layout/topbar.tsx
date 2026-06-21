'use client';

import { Menu, Moon, Sun, LogOut, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SesionCliente } from '@/types/auth';
import { useCerrarSesion } from '@/features/autenticacion/hooks/usar-cerrar-sesion';

interface TopBarProps {
  sesion: SesionCliente;
  onToggleAside: () => void;
}

function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();
}

export function TopBar({ sesion, onToggleAside }: TopBarProps): React.JSX.Element {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { cerrar, cargando } = useCerrarSesion();

  const handleCerrarSesion = async () => {
    await cerrar();
    router.push('/iniciar-sesion');
  };

  const contextoLabel =
    sesion.contexto.ambito === 'INSTITUCION'
      ? sesion.contexto.nombreInstitucion
      : `${sesion.contexto.nombreSede ?? sesion.contexto.nombreInstitucion}`;

  return (
    <header className="flex h-[--topbar-height] items-center gap-3 border-b border-[--color-border] bg-[--color-surface] px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleAside}
        aria-label="Toggle menú lateral"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-[--color-text-secondary]">{contextoLabel}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle tema"
      >
        <Sun className="h-4 w-4 dark:hidden" />
        <Moon className="hidden h-4 w-4 dark:block" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menú usuario">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{obtenerIniciales(sesion.nombreCompleto)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium text-[--color-text-primary] truncate">{sesion.nombreCompleto}</p>
            <p className="text-xs text-[--color-text-muted] truncate">{sesion.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/seleccionar-contexto')}>
            <RefreshCw className="h-4 w-4" />
            Cambiar contexto
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleCerrarSesion}
            disabled={cargando}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
