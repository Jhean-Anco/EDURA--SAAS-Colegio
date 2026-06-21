import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Currículo' };

export default function PaginaCurriculo(): never {
  redirect('/panel/curriculo/planes-estudio');
}
