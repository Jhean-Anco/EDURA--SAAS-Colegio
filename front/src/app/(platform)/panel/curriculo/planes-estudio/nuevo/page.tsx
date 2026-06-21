import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { NuevoPlanClient } from './_componentes/nuevo-plan-client';

export const metadata: Metadata = { title: 'Nuevo plan de estudio' };

export default async function PaginaNuevoPlan(): Promise<React.JSX.Element> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    redirect('/iniciar-sesion');
  }

  if (!sesion.contexto.permisos.includes('CURRICULO.PLANES.GESTIONAR')) {
    redirect('/panel/curriculo/planes-estudio');
  }

  return (
    <NuevoPlanClient
      ctx={{
        institucionId: sesion.contexto.institucionId,
        ambito: sesion.contexto.ambito,
        sedeId: sesion.contexto.sedeId,
      }}
    />
  );
}
