import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import {
  SERVICIO_AUDITORIA,
  ServicioAuditoria,
} from '../../../../../compartido/aplicacion/auditoria.puerto';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';

const ACCIONES_AUDITABLES: Record<string, string> = {
  'POST /api/v1/curriculo/areas': 'AREA_CURRICULAR_CREADA',
  'PATCH /api/v1/curriculo/areas/:id': 'AREA_CURRICULAR_ACTUALIZADA',
  'PATCH /api/v1/curriculo/areas/:id/estado': 'AREA_CURRICULAR_ESTADO_CAMBIADO',
  'POST /api/v1/curriculo/asignaturas': 'ASIGNATURA_CREADA',
  'PATCH /api/v1/curriculo/asignaturas/:id': 'ASIGNATURA_ACTUALIZADA',
  'PATCH /api/v1/curriculo/asignaturas/:id/estado':
    'ASIGNATURA_ESTADO_CAMBIADO',
  'POST /api/v1/curriculo/planes': 'PLAN_ESTUDIO_CREADO',
  'PATCH /api/v1/curriculo/planes/:id': 'PLAN_ESTUDIO_ACTUALIZADO',
  'PATCH /api/v1/curriculo/planes/:id/estado': 'PLAN_ESTUDIO_ESTADO_CAMBIADO',
  'POST /api/v1/curriculo/planes/:id/duplicar': 'PLAN_ESTUDIO_DUPLICADO',
  'POST /api/v1/curriculo/planes/:id/aprobar': 'PLAN_ESTUDIO_APROBADO',
  'POST /api/v1/curriculo/planes/:id/detalles': 'DETALLE_PLAN_AGREGADO',
  'PATCH /api/v1/curriculo/planes/:id/detalles/:id': 'DETALLE_PLAN_ACTUALIZADO',
  'PATCH /api/v1/curriculo/planes/:id/detalles/:id/estado':
    'DETALLE_PLAN_ESTADO_CAMBIADO',
};

function resolverAccion(method: string, url: string): string | null {
  const urlBase = url.split('?')[0] ?? '';
  const urlNormalizada = urlBase.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ':id',
  );
  return ACCIONES_AUDITABLES[`${method} ${urlNormalizada}`] ?? null;
}

@Injectable()
export class AuditoriaCurriculoInterceptor implements NestInterceptor {
  constructor(
    @Inject(SERVICIO_AUDITORIA)
    private readonly auditoria: ServicioAuditoria,
  ) {}

  intercept(
    contexto: ExecutionContext,
    siguiente: CallHandler,
  ): Observable<unknown> {
    const http = contexto.switchToHttp();
    const request = http.getRequest<
      Request & {
        contextoActual?: ContextoSolicitudAutenticada;
        correlationId?: string;
      }
    >();

    const accion = resolverAccion(request.method, request.url);
    if (!accion) return siguiente.handle();

    const ctx = request.contextoActual;
    const correlacion = request.correlationId ?? '';

    return siguiente.handle().pipe(
      tap({
        next: () => {
          void this.auditoria.registrar({
            institucionId: ctx?.institucionId ?? null,
            sedeId: ctx?.sedeId ?? null,
            usuarioId: ctx?.usuarioId ?? null,
            accion,
            recurso: 'CURRICULO',
            resultado: 'EXITO',
            idCorrelacion: correlacion,
          });
        },
        error: () => {
          void this.auditoria.registrar({
            institucionId: ctx?.institucionId ?? null,
            sedeId: ctx?.sedeId ?? null,
            usuarioId: ctx?.usuarioId ?? null,
            accion,
            recurso: 'CURRICULO',
            resultado: 'ERROR',
            idCorrelacion: correlacion,
          });
        },
      }),
    );
  }
}
