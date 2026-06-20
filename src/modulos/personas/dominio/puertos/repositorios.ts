import { Persona } from '../personas/persona';

export interface RepositorioPersonas {
  crear(persona: Persona): Promise<Persona>;
  buscarPorId(id: string): Promise<Persona | null>;
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

export interface RepositorioDocumentosIdentidadPersona {
  registrar(entrada: {
    personaId: string;
    institucionEducativaId: string;
    tipoDocumentoId: string;
    numero: string;
    numeroNormalizado: string;
  }): Promise<void>;
}

export interface RepositorioMediosContactoPersona {
  registrar(entrada: {
    personaId: string;
    institucionEducativaId: string;
    tipo: string;
    valor: string;
    valorNormalizado: string;
  }): Promise<void>;
}

export interface RepositorioDireccionesPersona {
  registrar(entrada: {
    personaId: string;
    institucionEducativaId: string;
    direccionLinea: string;
    referencia: string | null;
  }): Promise<void>;
}

export interface RepositorioVinculosPersonaMembresia {
  vincular(entrada: { personaId: string; membresiaId: string }): Promise<void>;
  desvincular(entrada: {
    personaId: string;
    membresiaId: string;
  }): Promise<void>;
}
