import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { FichaInstitucionClient } from './_componentes/ficha-institucion-client';

export const metadata: Metadata = { title: 'Perfil de la Institución' };

export default async function PaginaInstitucion(): Promise<React.JSX.Element> {
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
    <FichaInstitucionClient
      ctx={ctx}
      permisos={sesion.contexto.permisos}
    />
  );
}
