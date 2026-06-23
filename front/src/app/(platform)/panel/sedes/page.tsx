import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { ListadoSedesClient } from './_componentes/listado-sedes-client';

export const metadata: Metadata = { title: 'Gestión de Sedes' };

export default async function PaginaSedes(): Promise<React.JSX.Element> {
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
    <ListadoSedesClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
