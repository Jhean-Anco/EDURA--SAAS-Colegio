import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { CalendarioClient } from './_componentes/calendario-client';

export const metadata: Metadata = { title: 'Calendario Académico' };

export default async function PaginaCalendario(): Promise<React.JSX.Element> {
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
    <CalendarioClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
