import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectorContexto } from '@/features/autenticacion/componentes/selector-contexto';
import { obtenerSesionServidor } from '@/lib/auth/sesion';

export const metadata: Metadata = {
  title: 'Seleccionar contexto',
};

export default async function PaginaSeleccionContexto(): Promise<React.JSX.Element> {
  const sesion = await obtenerSesionServidor();

  if (!sesion.accessToken) {
    redirect('/iniciar-sesion');
  }
  if (sesion.contexto) {
    redirect('/panel');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[--color-surface-subtle] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo variant="completo" className="h-10" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Selecciona tu contexto</CardTitle>
            <CardDescription>
              Elige la institución o sede con la que trabajarás en esta sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SelectorContexto />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
