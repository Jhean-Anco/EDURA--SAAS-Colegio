export interface PanelInstitucionalInstitucionResumen {
  id: string;
  codigo: string;
  nombre: string;
}

export interface PanelInstitucionalSedeResumen {
  id: string;
  codigo: string;
  nombre: string;
}

export interface PanelInstitucionalIndicadorEstadoInfraestructuraResumen {
  estado: string;
  total: number;
}

export interface PanelInstitucionalAlertaResumen {
  id: string;
  tipo: string;
  titulo: string;
  prioridad: string;
  estado: string;
  moduloOrigen: string;
  fechaGeneracion: string;
}

export interface PanelInstitucionalComunicadoResumen {
  id: string;
  titulo: string;
  tipo: string;
  prioridad: string;
  estado: string;
  fechaPublicacion: string | null;
}

export interface PanelInstitucionalResumen {
  institucion: PanelInstitucionalInstitucionResumen;
  sede: PanelInstitucionalSedeResumen | null;
  periodoAcademico: { id: string; nombre: string } | null;
  indicadores: {
    totalSedesActivas: number;
    totalUsuariosActivos: number;
    totalEspaciosFisicosActivos: number;
    infraestructuraPorEstado: PanelInstitucionalIndicadorEstadoInfraestructuraResumen[];
    alertasPendientes: PanelInstitucionalAlertaResumen[];
    comunicadosRecientes: PanelInstitucionalComunicadoResumen[];
    totalEstudiantesActivos: number | null;
    totalDocentesActivos: number | null;
    matriculasPorEstado: Array<{ estado: string; total: number }>;
    asistenciaDelDia: null;
  };
  fechaActualizacion: string;
}
