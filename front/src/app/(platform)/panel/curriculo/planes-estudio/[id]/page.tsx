import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { DetallePlanClient } from './_componentes/detalle-plan-client';

export const metadata: Metadata = { title: 'Plan de estudio' };

interface Params {
  params: Promise<{ id: string }>;
}

export default async function PaginaDetallePlan({ params }: Params): Promise<React.JSX.Element> {
  const { id } = await params;
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    redirect('/iniciar-sesion');
  }

  return (
    <DetallePlanClient
      id={id}
      ctx={{
        institucionId: sesion.contexto.institucionId ?? '',
        ambito: sesion.contexto.ambito,
        sedeId: sesion.contexto.sedeId,
      }}
      permisos={sesion.contexto.permisos}
    />
  );
}
