import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { EditarPlanClient } from './_componentes/editar-plan-client';

export const metadata: Metadata = { title: 'Editar plan de estudio' };

interface Params {
  params: Promise<{ id: string }>;
}

export default async function PaginaEditarPlan({ params }: Params): Promise<React.JSX.Element> {
  const { id } = await params;
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    redirect('/iniciar-sesion');
  }
  if (!sesion.contexto.permisos.includes('CURRICULO.PLANES.GESTIONAR')) {
    redirect(`/panel/curriculo/planes-estudio/${id}`);
  }

  return (
    <EditarPlanClient
      id={id}
      ctx={{
        institucionId: sesion.contexto.institucionId ?? '',
        ambito: sesion.contexto.ambito,
        sedeId: sesion.contexto.sedeId,
      }}
    />
  );
}
