export type EstadoEstudiante =
  | 'ACTIVO'
  | 'INACTIVO'
  | 'RETIRADO'
  | 'TRASLADADO'
  | 'EGRESADO';

export interface EstudianteResumen {
  id: string;
  codigo: string;
  estado: EstadoEstudiante;
  sede: { id: string; codigo: string; nombre: string };
  persona: {
    id: string;
    nombres: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
  };
  documentoPrincipal: null | {
    id: string;
    tipoDocumento: string;
    numero: string;
  };
}
