'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Building2, MapPin, LogOut, Info, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCerrarSesion } from '@/features/autenticacion/hooks/usar-cerrar-sesion';
import type { ContextoDescriptor } from '@/types/auth';

interface PanelRolMinimoProps {
  usuario: {
    nombreCompleto: string;
    email: string;
  };
  contexto: ContextoDescriptor;
}

export function PanelRolMinimo({ usuario, contexto }: PanelRolMinimoProps): React.JSX.Element {
  const router = useRouter();
  const { cerrar, cargando } = useCerrarSesion();

  const handleCerrar = async () => {
    await cerrar();
    router.push('/iniciar-sesion');
  };

  // Definir módulos futuros y detalles según rol
  const obtenerDetallesRol = () => {
    switch (contexto.rolCodigo) {
      case 'PROPIETARIO_PLATAFORMA':
        return {
          rolLabel: 'Propietario de Plataforma',
          colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
          modulos: [
            { nombre: 'Gestión de Instituciones', desc: 'Creación y configuración de nuevos inquilinos en el sistema.' },
            { nombre: 'Monitoreo de Seguridad', desc: 'Auditoría integral de accesos, rotación de claves y eventos del sistema.' },
            { nombre: 'Configuración Global', desc: 'Definición de políticas globales, límites y parámetros del SaaS.' }
          ]
        };
      case 'DIRECTOR_SEDE':
        return {
          rolLabel: 'Director de Sede',
          colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
          modulos: [
            { nombre: 'Infraestructura de Sede', desc: 'Configuración de pabellones, aulas y espacios físicos.' },
            { nombre: 'Asignación de Secciones', desc: 'Gestión de tutores y distribución horaria en la sede.' },
            { nombre: 'Control de Matrículas', desc: 'Validación de vacantes y estado de matrículas locales.' }
          ]
        };
      case 'DOCENTE':
        return {
          rolLabel: 'Docente',
          colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
          modulos: [
            { nombre: 'Mis Clases & Horarios', desc: 'Acceso a los cursos asignados y control de sesiones.' },
            { nombre: 'Registro de Calificaciones', desc: 'Ingreso y ponderación de notas por trimestre.' },
            { nombre: 'Control de Asistencia', desc: 'Toma diaria de asistencia para estudiantes asignados.' }
          ]
        };
      case 'ESTUDIANTE':
        return {
          rolLabel: 'Estudiante',
          colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
          modulos: [
            { nombre: 'Mi Matrícula & Ficha', desc: 'Acceso a los detalles de tu matrícula activa.' },
            { nombre: 'Calificaciones y Libreta', desc: 'Consulta en tiempo real de calificaciones publicadas.' },
            { nombre: 'Mis Cursos y Tareas', desc: 'Visualización de asignaturas, tareas pendientes y horarios.' }
          ]
        };
      case 'APODERADO':
        return {
          rolLabel: 'Apoderado / Padre de Familia',
          colorClass: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
          modulos: [
            { nombre: 'Estudiantes Asociados', desc: 'Ficha académica y de asistencia de tus hijos a cargo.' },
            { nombre: 'Matrículas Asociadas', desc: 'Monitoreo de pagos, vacantes y estado de matrícula.' },
            { nombre: 'Comunicados y Avisos', desc: 'Notificaciones importantes de la institución educativa.' }
          ]
        };
      default:
        return {
          rolLabel: contexto.rolCodigo || 'Usuario Registrado',
          colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
          modulos: [
            { nombre: 'Perfil General', desc: 'Visualización de datos de identidad y configuraciones de cuenta.' }
          ]
        };
    }
  };

  const detalles = obtenerDetallesRol();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[--color-border] bg-gradient-to-br from-[--color-surface] to-[--color-surface-subtle] p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-8px] rounded-full bg-[--color-brand-100]/20 dark:bg-[--color-brand-900]/10 blur-xl" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${detalles.colorClass}`}>
                {detalles.rolLabel}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-[--color-text-primary] md:text-3xl">
              ¡Hola, {usuario.nombreCompleto}!
            </h2>
            
            <p className="text-sm text-[--color-text-secondary] max-w-xl">
              Bienvenido a tu panel de control personalizado en EDURA. Aquí tienes acceso a tu información y estado de sesión.
            </p>
          </div>

          <Button 
            variant="destructive" 
            onClick={handleCerrar} 
            disabled={cargando}
            className="w-full md:w-auto shrink-0"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Identidad de Usuario */}
        <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wider">
            Identidad del Usuario
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[--color-brand-600] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[--color-text-muted]">Nombre completo</p>
                <p className="text-sm font-medium text-[--color-text-primary] truncate">{usuario.nombreCompleto}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[--color-brand-600] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[--color-text-muted]">Correo electrónico</p>
                <p className="text-sm font-medium text-[--color-text-primary] truncate">{usuario.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de Contexto */}
        <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 space-y-4 md:col-span-2">
          <h3 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wider">
            Contexto Activo
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[--color-brand-600] shrink-0" />
              <div>
                <p className="text-xs text-[--color-text-muted]">Ámbito de Acceso</p>
                <p className="text-sm font-medium text-[--color-text-primary]">{contexto.ambito}</p>
              </div>
            </div>
            {contexto.institucionNombre && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[--color-brand-600] shrink-0" />
                <div>
                  <p className="text-xs text-[--color-text-muted]">Institución</p>
                  <p className="text-sm font-medium text-[--color-text-primary]">{contexto.institucionNombre}</p>
                </div>
              </div>
            )}
            {contexto.sedeNombre && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[--color-brand-600] shrink-0" />
                <div>
                  <p className="text-xs text-[--color-text-muted]">Sede Educativa</p>
                  <p className="text-sm font-medium text-[--color-text-primary]">{contexto.sedeNombre}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Módulos Disponibles y Funcionalidades Futuras */}
      <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-[--color-border]">
          <Info className="h-5 w-5 text-[--color-brand-600]" />
          <div>
            <h3 className="text-lg font-semibold text-[--color-text-primary]">
              Funcionalidades y Módulos de tu Rol
            </h3>
            <p className="text-xs text-[--color-text-muted]">
              Planificación del incremento y estado actual de implementación.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {detalles.modulos.map((mod, index) => (
            <div key={index} className="flex flex-col justify-between rounded-lg border border-[--color-border]/60 bg-[--color-surface-subtle]/50 p-4 space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-[--color-text-primary]">{mod.nombre}</h4>
                <p className="text-xs text-[--color-text-secondary] mt-1">{mod.desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-[--color-text-muted]">
                <Lock className="h-3 w-3" />
                <span>Próximamente</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-[--color-brand-50]/50 dark:bg-[--color-brand-900]/10 border border-[--color-brand-100] p-4 text-xs text-[--color-brand-800] dark:text-[--color-brand-300]">
          <strong>Aviso de Desarrollo:</strong> Este rol se encuentra en su fase inicial de integración en el portal unificado. Las APIs correspondientes han sido endurecidas a nivel de backend y la capa visual se irá desplegando progresivamente.
        </div>
      </div>
    </div>
  );
}
