import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Currículo',
    default: 'Currículo',
  },
};

export default function CurriculoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return <>{children}</>;
}
