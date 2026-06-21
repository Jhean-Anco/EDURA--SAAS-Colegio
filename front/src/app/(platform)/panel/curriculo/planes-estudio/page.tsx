import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { ListadoPlanesClient } from './_componentes/listado-planes-client';

export const metadata: Metadata = { title: 'Planes de estudio' };

export default async function PaginaListadoPlanes(): Promise<React.JSX.Element> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    redirect('/iniciar-sesion');
  }

  const ctx = {
    institucionId: sesion.contexto.institucionId,
    ambito: sesion.contexto.ambito,
    sedeId: sesion.contexto.sedeId,
  };

  return (
    <ListadoPlanesClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
