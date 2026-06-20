export interface PanelInstitucionalRespuesta {
  institucion: {
    id: string;
    codigo: string;
    nombre: string;
  };
  sede: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
  periodoAcademico: {
    id: string;
    nombre: string;
  } | null;
  indicadores: {
    totalSedesActivas: number;
    totalUsuariosActivos: number;
    totalEspaciosFisicosActivos: number;
    infraestructuraPorEstado: Array<{ estado: string; total: number }>;
    alertasPendientes: Array<{
      id: string;
      tipo: string;
      titulo: string;
      prioridad: string;
      estado: string;
      moduloOrigen: string;
      fechaGeneracion: string;
    }>;
    comunicadosRecientes: Array<{
      id: string;
      titulo: string;
      tipo: string;
      prioridad: string;
      estado: string;
      fechaPublicacion: string | null;
    }>;
    totalEstudiantesActivos: number | null;
    totalDocentesActivos: number | null;
    matriculasPorEstado: Array<{ estado: string; total: number }>;
    asistenciaDelDia: null;
  };
  fechaActualizacion: string;
}
