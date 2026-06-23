import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { ListadoPersonasClient } from './_componentes/listado-personas-client';

export const metadata: Metadata = { title: 'Gestión de Personas' };

export default async function PaginaPersonas(): Promise<React.JSX.Element> {
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
    <ListadoPersonasClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
