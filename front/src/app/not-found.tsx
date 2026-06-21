import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-[--color-text-muted]">404</h1>
      <h2 className="text-xl font-semibold text-[--color-text-primary]">Página no encontrada</h2>
      <p className="text-[--color-text-secondary]">
        La página que buscas no existe o fue movida.
      </p>
      <Button asChild>
        <Link href="/panel">Volver al panel</Link>
      </Button>
    </div>
  );
}
