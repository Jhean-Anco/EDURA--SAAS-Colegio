import { redirect } from 'next/navigation';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { Shell } from '@/components/layout/shell';
import { resolverNavegacion } from '@/lib/navegacion/registro';
import type { SesionCliente } from '@/types/auth';

export default async function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const sesion = await obtenerSesionServidor();

  if (!sesion.accessToken) {
    redirect('/iniciar-sesion');
  }
  if (!sesion.contexto) {
    redirect('/seleccionar-contexto');
  }

  const sesionCliente: SesionCliente = {
    nombreCompleto: sesion.nombreCompleto ?? 'Usuario',
    email: sesion.email ?? '',
    contexto: sesion.contexto,
  };

  const grupos = resolverNavegacion(sesion.contexto);

  return (
    <Shell sesion={sesionCliente} grupos={grupos}>
      {children}
    </Shell>
  );
}
