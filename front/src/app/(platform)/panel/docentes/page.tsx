import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { ListadoDocentesClient } from './_componentes/listado-docentes-client';

export const metadata: Metadata = { title: 'Gestión de Docentes' };

export default async function PaginaDocentes(): Promise<React.JSX.Element> {
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
    <ListadoDocentesClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
