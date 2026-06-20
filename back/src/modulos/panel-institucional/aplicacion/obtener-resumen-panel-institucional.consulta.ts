import { ForbiddenException } from '@nestjs/common';
import { ContextoSolicitudAutenticada } from '../../../compartido/aplicacion/contexto-solicitud-autenticada';
import {
  EntradaResumenPanelInstitucional,
  PanelInstitucionalConsulta,
} from '../dominio/puertos/panel-institucional.consulta';
import { PanelInstitucionalResumen } from '../dominio/panel-institucional.resumen';

export class ObtenerResumenPanelInstitucionalConsulta {
  constructor(private readonly consulta: PanelInstitucionalConsulta) {}

  ejecutar(
    contexto: ContextoSolicitudAutenticada | undefined,
    entrada: Omit<
      EntradaResumenPanelInstitucional,
      'usuarioId' | 'institucionId'
    >,
  ): Promise<PanelInstitucionalResumen> {
    if (!contexto?.institucionId || !contexto.usuarioId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    if (
      contexto.ambito === 'SEDE' &&
      contexto.sedeId &&
      entrada.sedeId &&
      contexto.sedeId !== entrada.sedeId
    ) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    return this.consulta.obtenerResumen({
      usuarioId: contexto.usuarioId,
      institucionId: contexto.institucionId,
      sedeId:
        contexto.ambito === 'SEDE'
          ? (contexto.sedeId ?? entrada.sedeId ?? null)
          : (entrada.sedeId ?? null),
      idPeriodoAcademico: entrada.idPeriodoAcademico ?? null,
    });
  }
}
