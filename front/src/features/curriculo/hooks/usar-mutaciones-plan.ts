'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/bff/cliente';
import { claves } from '@/lib/query/claves';
import type {
  CrearPlanSolicitud,
  ActualizarPlanSolicitud,
  CambiarEstadoPlanSolicitud,
  DuplicarPlanSolicitud,
  AgregarDetalleSolicitud,
  ActualizarDetalleSolicitud,
  CambiarEstadoDetalleSolicitud,
} from '@/types/curriculo';
import type { ContextoDescriptor } from '@/types/auth';

type Ctx = Pick<ContextoDescriptor, 'institucionId' | 'ambito' | 'sedeId'>;

export function usarCrearPlan(ctx: Ctx) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearPlanSolicitud) =>
      apiFetch<{ id: string }>('/api/panel/curriculo/planes', { method: 'POST', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['curriculo', ctx, 'planes'] });
    },
  });
}

export function usarActualizarPlan(ctx: Ctx, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ActualizarPlanSolicitud) =>
      apiFetch<void>(`/api/panel/curriculo/planes/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: claves.curriculo.plan(ctx, id) });
      void qc.invalidateQueries({ queryKey: ['curriculo', ctx, 'planes'] });
    },
  });
}

export function usarAprobarPlan(ctx: Ctx, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<void>(`/api/panel/curriculo/planes/${id}/aprobar`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: claves.curriculo.plan(ctx, id) });
      void qc.invalidateQueries({ queryKey: ['curriculo', ctx, 'planes'] });
    },
  });
}

export function usarCambiarEstadoPlan(ctx: Ctx, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CambiarEstadoPlanSolicitud) =>
      apiFetch<void>(`/api/panel/curriculo/planes/${id}/estado`, { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: claves.curriculo.plan(ctx, id) });
      void qc.invalidateQueries({ queryKey: ['curriculo', ctx, 'planes'] });
    },
  });
}

export function usarDuplicarPlan(ctx: Ctx, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DuplicarPlanSolicitud) =>
      apiFetch<{ id: string }>(`/api/panel/curriculo/planes/${id}/duplicar`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['curriculo', ctx, 'planes'] });
    },
  });
}

export function usarAgregarDetalle(ctx: Ctx, idPlan: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AgregarDetalleSolicitud) =>
      apiFetch<{ id: string }>(`/api/panel/curriculo/planes/${idPlan}/detalles`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: claves.curriculo.plan(ctx, idPlan) });
      void qc.invalidateQueries({ queryKey: claves.curriculo.detalles(ctx, idPlan) });
    },
  });
}

export function usarActualizarDetalle(ctx: Ctx, idPlan: string, idDetalle: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ActualizarDetalleSolicitud) =>
      apiFetch<void>(
        `/api/panel/curriculo/planes/${idPlan}/detalles/${idDetalle}`,
        { method: 'PATCH', body },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: claves.curriculo.plan(ctx, idPlan) });
      void qc.invalidateQueries({ queryKey: claves.curriculo.detalles(ctx, idPlan) });
    },
  });
}

export function usarCambiarEstadoDetalle(ctx: Ctx, idPlan: string, idDetalle: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CambiarEstadoDetalleSolicitud) =>
      apiFetch<void>(
        `/api/panel/curriculo/planes/${idPlan}/detalles/${idDetalle}/estado`,
        { method: 'PATCH', body },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: claves.curriculo.plan(ctx, idPlan) });
      void qc.invalidateQueries({ queryKey: claves.curriculo.detalles(ctx, idPlan) });
    },
  });
}
