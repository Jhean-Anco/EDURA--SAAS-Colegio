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
  'POST /api/v1/estructura-academica/anios': 'ANIO_ACADEMICO.CREAR',
  'PATCH /api/v1/estructura-academica/anios/:id': 'ANIO_ACADEMICO.ACTUALIZAR',
  'PATCH /api/v1/estructura-academica/anios/:id/estado':
    'ANIO_ACADEMICO.CAMBIAR_ESTADO',
  'POST /api/v1/estructura-academica/anios/:id/periodos':
    'PERIODO_ACADEMICO.CREAR',
  'PATCH /api/v1/estructura-academica/anios/:id/periodos/:id/estado':
    'PERIODO_ACADEMICO.CAMBIAR_ESTADO',
  'PATCH /api/v1/estructura-academica/anios/:id/periodos/:id':
    'PERIODO_ACADEMICO.ACTUALIZAR',
  'POST /api/v1/estructura-academica/niveles': 'NIVEL_EDUCATIVO.CREAR',
  'PATCH /api/v1/estructura-academica/niveles/:id':
    'NIVEL_EDUCATIVO.ACTUALIZAR',
  'POST /api/v1/estructura-academica/grados': 'GRADO_EDUCATIVO.CREAR',
  'PATCH /api/v1/estructura-academica/grados/:id': 'GRADO_EDUCATIVO.ACTUALIZAR',
  'POST /api/v1/estructura-academica/ofertas': 'OFERTA_GRADO_SEDE.CREAR',
  'PATCH /api/v1/estructura-academica/ofertas/:id':
    'OFERTA_GRADO_SEDE.ACTUALIZAR',
  'POST /api/v1/estructura-academica/ofertas/:id/secciones':
    'SECCION_ACADEMICA.CREAR',
  'PATCH /api/v1/estructura-academica/ofertas/:id/secciones/:id':
    'SECCION_ACADEMICA.ACTUALIZAR',
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
export class AuditoriaEstructuraAcademicaInterceptor implements NestInterceptor {
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
            recurso: 'ESTRUCTURA_ACADEMICA',
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
            recurso: 'ESTRUCTURA_ACADEMICA',
            resultado: 'ERROR',
            idCorrelacion: correlacion,
          });
        },
      }),
    );
  }
}
