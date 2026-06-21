import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormularioLogin } from '@/features/autenticacion/componentes/formulario-login';
import { obtenerSesionServidor } from '@/lib/auth/sesion';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

export default async function PaginaLogin(): Promise<React.JSX.Element> {
  const sesion = await obtenerSesionServidor();
  if (sesion.accessToken && sesion.contexto) {
    redirect('/panel');
  }
  if (sesion.accessToken && !sesion.contexto) {
    redirect('/seleccionar-contexto');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[--color-surface-subtle] p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo variant="completo" className="h-10" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioLogin />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[--color-text-muted]">
          © {new Date().getFullYear()} EDURA. Sistema de gestión educativa.
        </p>
      </div>
    </main>
  );
}
