import { PanelInstitucionalResumen } from '../panel-institucional.resumen';

export interface EntradaResumenPanelInstitucional {
  usuarioId: string;
  institucionId: string;
  sedeId?: string | null;
  idPeriodoAcademico?: string | null;
}

export interface PanelInstitucionalConsulta {
  obtenerResumen(
    entrada: EntradaResumenPanelInstitucional,
  ): Promise<PanelInstitucionalResumen>;
}
