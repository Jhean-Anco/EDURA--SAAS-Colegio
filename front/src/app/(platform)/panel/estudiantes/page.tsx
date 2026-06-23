import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { ListadoEstudiantesClient } from './_componentes/listado-estudiantes-client';

export const metadata: Metadata = { title: 'Gestión de Estudiantes' };

export default async function PaginaEstudiantes(): Promise<React.JSX.Element> {
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
    <ListadoEstudiantesClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
