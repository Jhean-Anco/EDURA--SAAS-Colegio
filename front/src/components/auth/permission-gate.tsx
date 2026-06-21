'use client';

import type { ContextoDescriptor } from '@/types/auth';

interface PermissionGateProps {
  contexto: ContextoDescriptor;
  permisos: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  contexto,
  permisos,
  children,
  fallback = null,
}: PermissionGateProps): React.JSX.Element {
  const tieneAcceso = permisos.every((p) => contexto.permisos.includes(p));
  return <>{tieneAcceso ? children : fallback}</>;
}
