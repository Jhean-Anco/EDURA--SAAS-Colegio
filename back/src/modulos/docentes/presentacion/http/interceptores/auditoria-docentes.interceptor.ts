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
  'POST /api/v1/docentes': 'DOCENTE.CREAR',
  'PATCH /api/v1/docentes/:id': 'DOCENTE.ACTUALIZAR',
  'PATCH /api/v1/docentes/:id/estado': 'DOCENTE.CAMBIAR_ESTADO',
  'POST /api/v1/docentes/:id/sedes': 'DOCENTE.ASIGNAR_SEDE',
  'PATCH /api/v1/docentes/:id/sedes/:idAsignacion': 'DOCENTE.ACTUALIZAR_SEDE',
  'POST /api/v1/docentes/:id/sedes/:idAsignacion/establecer-principal':
    'DOCENTE.ESTABLECER_SEDE_PRINCIPAL',
  'POST /api/v1/docentes/:id/especialidades': 'DOCENTE.ASIGNAR_ESPECIALIDAD',
  'PATCH /api/v1/docentes/:id/especialidades/:idAsignacion':
    'DOCENTE.ACTUALIZAR_ESPECIALIDAD',
  'POST /api/v1/especialidades-profesionales': 'ESPECIALIDAD_PROFESIONAL.CREAR',
  'PATCH /api/v1/especialidades-profesionales/:id':
    'ESPECIALIDAD_PROFESIONAL.ACTUALIZAR',
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
export class AuditoriaDocentesInterceptor implements NestInterceptor {
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
            recurso: 'DOCENTES',
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
            recurso: 'DOCENTES',
            resultado: 'ERROR',
            idCorrelacion: correlacion,
          });
        },
      }),
    );
  }
}
