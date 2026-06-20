import { Controller, Get, Query } from '@nestjs/common';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ObtenerResumenPanelInstitucionalConsulta } from '../../../aplicacion/obtener-resumen-panel-institucional.consulta';
import { ResumenPanelInstitucionalSolicitud } from '../solicitudes/resumen-panel-institucional.solicitud';
import { PanelInstitucionalRespuesta } from '../respuestas/panel-institucional.respuesta';

@Controller('panel-institucional')
export class PanelInstitucionalControlador {
  constructor(
    private readonly obtenerResumen: ObtenerResumenPanelInstitucionalConsulta,
  ) {}

  @Permisos('PANEL_INSTITUCIONAL.RESUMEN.LEER')
  @Get('resumen')
  async resumen(
    @ContextoActual() contexto: ContextoSolicitudAutenticada | undefined,
    @Query() query: ResumenPanelInstitucionalSolicitud,
  ): Promise<PanelInstitucionalRespuesta> {
    return this.obtenerResumen.ejecutar(contexto, {
      sedeId: query.idSede ?? null,
      idPeriodoAcademico: query.idPeriodoAcademico ?? null,
    });
  }
}
