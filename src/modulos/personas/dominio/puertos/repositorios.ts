import { Persona } from '../personas/persona';

export interface RepositorioPersonas {
  crear(persona: Persona): Promise<Persona>;
  buscarPorId(id: string): Promise<Persona | null>;
  buscarPorIdEnInstitucion(
    id: string,
    institucionEducativaId: string,
  ): Promise<Persona | null>;
  listarPorInstitucion(
    institucionEducativaId: string,
    filtro: {
      texto?: string;
      estado?: string;
      pagina: number;
      tamano: number;
    },
  ): Promise<{ datos: Persona[]; total: number }>;
}

export interface RegistrarDocumentoEntrada {
  personaId: string;
  institucionEducativaId: string;
  tipoDocumentoId: string;
  numero: string;
  numeroNormalizado: string;
  codigoPaisEmision?: string | null;
  esPrincipal?: boolean;
  fechaEmision?: Date | null;
  fechaVencimiento?: Date | null;
}

export interface RepositorioDocumentosIdentidadPersona {
  registrar(entrada: RegistrarDocumentoEntrada): Promise<void>;
}

export interface RegistrarMedioContactoEntrada {
  personaId: string;
  institucionEducativaId: string;
  tipo: string;
  valor: string;
  valorNormalizado: string;
  esPrincipal?: boolean;
}

export interface RepositorioMediosContactoPersona {
  registrar(entrada: RegistrarMedioContactoEntrada): Promise<void>;
}

export interface RegistrarDireccionEntrada {
  personaId: string;
  institucionEducativaId: string;
  direccionLinea: string;
  referencia: string | null;
  latitud?: number | null;
  longitud?: number | null;
  ubigeoId?: string | null;
  esPrincipal?: boolean;
}

export interface RepositorioDireccionesPersona {
  registrar(entrada: RegistrarDireccionEntrada): Promise<void>;
}

export interface RepositorioVinculosPersonaMembresia {
  vincular(entrada: { personaId: string; membresiaId: string }): Promise<void>;
  desvincular(entrada: {
    personaId: string;
    membresiaId: string;
  }): Promise<void>;
}
