import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { ListadoMatriculasClient } from './_componentes/listado-matriculas-client';

export const metadata: Metadata = { title: 'Gestión de Matrículas' };

export default async function PaginaMatriculas(): Promise<React.JSX.Element> {
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
    <ListadoMatriculasClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
