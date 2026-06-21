import type { LucideIcon } from 'lucide-react';
import type { Ambito } from './auth';

export interface NavItem {
  codigo: string;
  etiqueta: string;
  ruta: string;
  icono: LucideIcon;
  permisos: string[];
  ambitos: Ambito[];
  subitems?: NavItem[];
}

export interface NavGroup {
  etiqueta: string;
  items: NavItem[];
}
