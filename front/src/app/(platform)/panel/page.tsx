import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Users, BookOpen, LayoutGrid } from 'lucide-react';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { PanelClientWrapper } from './_componentes/panel-client-wrapper';
import { PanelRolMinimo } from '@/features/panel/componentes/panel-rol-minimo';

export const metadata: Metadata = {
  title: 'Panel',
};

export default async function PaginaPanel(): Promise<React.JSX.Element> {
  const sesion = await obtenerSesionServidor();
  if (!sesion.accessToken || !sesion.contexto) {
    redirect('/iniciar-sesion');
  }

  const rol = sesion.contexto.rolCodigo;

  if (rol !== 'ADMINISTRADOR_INSTITUCION') {
    const usuario = {
      nombreCompleto: sesion.nombreCompleto ?? 'Usuario',
      email: sesion.email ?? '',
    };
    return <PanelRolMinimo usuario={usuario} contexto={sesion.contexto} />;
  }

  const contexto = {
    institucionId: sesion.contexto.institucionId,
    ambito: sesion.contexto.ambito,
    sedeId: sesion.contexto.sedeId,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-text-primary]">Panel institucional</h1>
        <p className="text-sm text-[--color-text-secondary]">
          Resumen general del año académico en curso.
        </p>
      </div>
      <PanelClientWrapper
        contexto={contexto}
        iconos={{ estudiantes: Users, docentes: BookOpen, secciones: LayoutGrid }}
      />
    </div>
  );
}

