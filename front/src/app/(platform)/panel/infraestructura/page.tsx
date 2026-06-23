import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { InfraestructuraSedeClient } from './_componentes/infraestructura-sede-client';

export const metadata: Metadata = { title: 'Infraestructura Física' };

export default async function PaginaInfraestructura(): Promise<React.JSX.Element> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    redirect('/iniciar-sesion');
  }

  const ctx = {
    institucionId: sesion.contexto.institucionId ?? '',
    ambito: sesion.contexto.ambito,
    sedeId: sesion.contexto.sedeId,
  };

  return (
    <InfraestructuraSedeClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
