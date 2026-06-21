import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'completo' | 'icono';
  className?: string;
}

export function Logo({ variant = 'completo', className }: LogoProps): React.JSX.Element {
  if (variant === 'icono') {
    return (
      <Image
        src="/brand/logo-sin-fondo.png"
        alt="EDURA"
        width={32}
        height={32}
        className={cn('object-contain', className)}
        priority
      />
    );
  }

  return (
    <Image
      src="/brand/logo-pagina.png"
      alt="EDURA"
      width={120}
      height={32}
      className={cn('object-contain', className)}
      priority
    />
  );
}
