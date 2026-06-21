import { EstadoEstudiante } from '../estudiantes/estudiante';

export interface FichaEstudiante {
  estudiante: {
    id: string;
    codigo: string;
    estado: EstadoEstudiante;
    fechaIngreso: string | null;
    fechaRetiro: string | null;
    observacion: string | null;
  };
  persona: {
    id: string;
    nombres: string;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
  };
  sede: { id: string; codigo: string; nombre: string };
  documentosIdentidadPersona: Array<{
    id: string;
    tipoDocumento: string;
    numero: string;
    esPrincipal: boolean;
    estado: string;
  }>;
  mediosContactoPersona: Array<{
    id: string;
    tipo: string;
    valor: string;
    esPrincipal: boolean;
    estado: string;
  }>;
  apoderados: Array<{
    id: string;
    idPersona: string;
    parentesco: string;
    esPrincipal: boolean;
    puedeRecoger: boolean;
    recibeComunicaciones: boolean;
    estado: string;
  }>;
  documentosAdministrativos: Array<{
    id: string;
    tipoDocumento: string;
    nombre: string;
    estado: string;
  }>;
}
