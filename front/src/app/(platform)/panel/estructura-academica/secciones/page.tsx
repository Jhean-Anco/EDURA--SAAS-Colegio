import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { SeccionesClient } from './_componentes/secciones-client';

export const metadata: Metadata = { title: 'Oferta y Secciones' };

export default async function PaginaSecciones(): Promise<React.JSX.Element> {
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
    <SeccionesClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
