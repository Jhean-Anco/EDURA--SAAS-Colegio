import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import { obtenerExperienciaAccesoServidor } from '@/lib/auth/experiencia-servidor';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const exp = await obtenerExperienciaAccesoServidor();
  const nombre = exp.identidadVisual?.nombreMarca || 'EDURA';
  return {
    title: {
      default: nombre,
      template: `%s | ${nombre}`,
    },
    description: exp.identidadVisual?.mensajeLogin || 'Sistema de gestión educativa EDURA',
    icons: {
      icon: exp.identidadVisual?.faviconUrl || '/favicon.ico',
    },
    robots: 'noindex, nofollow',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  const exp = await obtenerExperienciaAccesoServidor();
  const tema = exp.identidadVisual;

  const cssVariables = tema ? `
    :root {
      --marca-primaria: ${tema.colorPrimario};
      --marca-sobre-primaria: ${tema.colorSobrePrimario};
      --marca-secundaria: ${tema.colorSecundario};
      --marca-acento: ${tema.colorAcento};
      --marca-fondo: ${tema.colorFondo};
      --marca-superficie: ${tema.colorSuperficie};
      --marca-texto-principal: ${tema.colorTextoPrincipal};
      --marca-texto-secundario: ${tema.colorTextoSecundario};
    }
  ` : '';

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        {cssVariables && (
          <style id="theme-variables" dangerouslySetInnerHTML={{ __html: cssVariables }} />
        )}
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
