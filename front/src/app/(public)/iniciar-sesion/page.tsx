import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GraduationCap, ShieldCheck, Building2, Landmark } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { FormularioLogin } from '@/features/autenticacion/componentes/formulario-login';
import { obtenerSesionServidor } from '@/lib/auth/sesion';
import { obtenerExperienciaAccesoServidor } from '@/lib/auth/experiencia-servidor';

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

  const exp = await obtenerExperienciaAccesoServidor();
  const esInstitucional = exp.tipoAcceso === 'INSTITUCION';
  const tema = exp.identidadVisual;

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-(--marca-fondo)">
      {/* ── Left Hero Panel ── */}
      <div 
        className="relative hidden w-[55%] lg:flex lg:flex-col lg:justify-between overflow-hidden transition-all duration-500"
        style={{ 
          background: tema?.fondoLoginUrl 
            ? `linear-gradient(rgba(18, 58, 109, 0.85), rgba(10, 25, 47, 0.95)), url(${tema.fondoLoginUrl}) center/cover no-repeat`
            : 'var(--gradient-hero)' 
        }}
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
            {tema?.logoPrincipalUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={tema.logoPrincipalUrl} 
                alt={`Logo ${tema.nombreMarca}`} 
                className="h-20 max-w-[200px] object-contain mb-8 drop-shadow-lg"
              />
            ) : (
              <Logo variant="icono" className="h-14 w-14 mb-8 drop-shadow-lg" />
            )}
            
            <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
              {tema?.nombreMarca || 'EDURA'}
              <span className="block mt-2 bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent text-2xl xl:text-3xl font-medium">
                {tema?.lema || 'Plataforma de gestión educativa inteligente'}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-indigo-200/80">
              {esInstitucional 
                ? 'Accede de manera segura a tu portal educativo. Administra tus asignaturas, matrículas, notas y mantente en comunicación constante.' 
                : 'Portal administrativo central de EDURA. Administra múltiples colegios, configura infraestructura y visualiza analíticas globales.'
              }
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid grid-cols-1 gap-4 xl:grid-cols-3 animate-slide-up stagger-3">
            <FeatureCard
              icon={esInstitucional ? <Landmark className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              title={esInstitucional ? "Tu Colegio" : "SaaS Global"}
              desc={esInstitucional ? "Identidad visual y accesos personalizados." : "Gestiona múltiples sedes desde un solo panel."}
            />
            <FeatureCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Matrícula digital"
              desc="Inscripción automatizada y seguimiento de estudiantes."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Aislamiento"
              desc="Seguridad y confidencialidad total de tus datos."
            />
          </div>
        </div>

        {/* Bottom branding */}
        <div className="relative z-10 px-12 pb-8 xl:px-20">
          <p className="text-xs text-indigo-300/50">
            © {new Date().getFullYear()} {tema?.nombreMarca || 'EDURA'} · {tema?.textoPieLogin || 'Tecnología provista por EDURA'}
          </p>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-(--marca-superficie) p-6 sm:p-8 lg:p-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden animate-fade-in">
          {tema?.logoPrincipalUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={tema.logoPrincipalUrl} 
              alt={`Logo ${tema.nombreMarca}`} 
              className="h-14 max-w-[150px] object-contain"
            />
          ) : (
            <Logo variant="completo" className="h-10" />
          )}
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-(--marca-texto-principal)">
              {tema?.tituloLogin || 'Bienvenido de vuelta'}
            </h2>
            <p className="mt-2 text-sm text-(--marca-texto-secundario)">
              {tema?.mensajeLogin || 'Ingresa tus credenciales para acceder.'}
            </p>
          </div>

          <FormularioLogin />

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border,rgba(0,0,0,0.1))]" />
            <span className="text-xs text-(--marca-texto-secundario) font-medium">EDURA</span>
            <div className="h-px flex-1 bg-[var(--color-border,rgba(0,0,0,0.1))]" />
          </div>

          <p className="mt-4 text-center text-xs text-(--marca-texto-secundario)">
            {tema?.textoPieLogin || 'Tecnología provista por EDURA'}
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
