'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { AnioAcademico, GradoEducativo, EstadoPlan } from '@/types/curriculo';

const ESTADOS_PLAN: { valor: EstadoPlan; etiqueta: string }[] = [
  { valor: 'BORRADOR', etiqueta: 'Borrador' },
  { valor: 'APROBADO', etiqueta: 'Aprobado' },
  { valor: 'VIGENTE', etiqueta: 'Vigente' },
  { valor: 'CERRADO', etiqueta: 'Cerrado' },
  { valor: 'ANULADO', etiqueta: 'Anulado' },
];

interface FiltrosPlanesProps {
  anios: AnioAcademico[];
  grados: GradoEducativo[];
}

export function FiltrosPlanes({ anios, grados }: FiltrosPlanesProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const actualizar = useCallback(
    (clave: string, valor: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (valor) {
        next.set(clave, valor);
      } else {
        next.delete(clave);
      }
      router.replace(`${pathname}?${next.toString()}`);
    },
    [router, pathname, params],
  );

  const limpiar = () => {
    router.replace(pathname);
  };

  const hayFiltros = params.has('idAnio') || params.has('idGrado') || params.has('estado');

  return (
    <fieldset className="flex flex-wrap items-end gap-3">
      <legend className="sr-only">Filtros de planes de estudio</legend>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filtro-anio">Año académico</Label>
        <Select
          value={params.get('idAnio') ?? ''}
          onValueChange={(v) => actualizar('idAnio', v || null)}
        >
          <SelectTrigger id="filtro-anio" className="w-44">
            <SelectValue placeholder="Todos los años" />
          </SelectTrigger>
          <SelectContent>
            {anios.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.anio} — {a.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filtro-grado">Grado</Label>
        <Select
          value={params.get('idGrado') ?? ''}
          onValueChange={(v) => actualizar('idGrado', v || null)}
        >
          <SelectTrigger id="filtro-grado" className="w-44">
            <SelectValue placeholder="Todos los grados" />
          </SelectTrigger>
          <SelectContent>
            {grados.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.nombreNivel} — {g.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="filtro-estado">Estado</Label>
        <Select
          value={params.get('estado') ?? ''}
          onValueChange={(v) => actualizar('estado', v || null)}
        >
          <SelectTrigger id="filtro-estado" className="w-36">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_PLAN.map((e) => (
              <SelectItem key={e.valor} value={e.valor}>
                {e.etiqueta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hayFiltros && (
        <Button variant="ghost" size="sm" onClick={limpiar}>
          Limpiar filtros
        </Button>
      )}
    </fieldset>
  );
}
