import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GraduationCap, ShieldCheck, Building2 } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
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
    <main className="relative flex min-h-screen overflow-hidden">
      {/* ── Left Hero Panel ── */}
      <div className="relative hidden w-[55%] lg:flex lg:flex-col lg:justify-between overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse-soft" style={{ animationDelay: '3s' }} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-20">
          <div className="animate-slide-up">
            <Logo variant="icono" className="h-14 w-14 mb-8 drop-shadow-lg" />
            <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
              Gestión educativa
              <span className="block mt-1 bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
                inteligente
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-indigo-200/80">
              Administra instituciones, matrículas, calificaciones y más desde un solo lugar. Diseñado para educadores que buscan excelencia.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid grid-cols-1 gap-3 xl:grid-cols-3 animate-slide-up stagger-3">
            <FeatureCard
              icon={<Building2 className="h-5 w-5" />}
              title="Multi-institución"
              desc="Gestiona múltiples sedes desde un panel unificado."
            />
            <FeatureCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Matrícula digital"
              desc="Flujos automatizados de inscripción y seguimiento."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Seguridad"
              desc="Aislamiento total de datos por institución."
            />
          </div>
        </div>

        {/* Bottom branding */}
        <div className="relative z-10 px-12 pb-8 xl:px-20">
          <p className="text-xs text-indigo-300/50">
            © {new Date().getFullYear()} EDURA · Sistema de gestión educativa SaaS
          </p>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[--color-surface] p-6 sm:p-8 lg:p-12">
        {/* Mobile logo (hidden on desktop since hero has it) */}
        <div className="mb-8 lg:hidden animate-fade-in">
          <Logo variant="completo" className="h-10" />
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[--color-text-primary]">
              Bienvenido de vuelta
            </h2>
            <p className="mt-2 text-sm text-[--color-text-secondary]">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <FormularioLogin />

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[--color-border]" />
            <span className="text-xs text-[--color-text-muted]">EDURA</span>
            <div className="h-px flex-1 bg-[--color-border]" />
          </div>

          <p className="mt-4 text-center text-xs text-[--color-text-muted]">
            Sistema de gestión educativa integral.
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-indigo-300 transition-colors group-hover:bg-white/20 group-hover:text-white">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-indigo-200/60">{desc}</p>
    </div>
  );
}
