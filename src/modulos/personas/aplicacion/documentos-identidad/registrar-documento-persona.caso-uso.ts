import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  RegistrarDocumentoEntrada,
  RepositorioDocumentosIdentidadPersona,
  RepositorioPersonas,
} from '../../dominio/puertos/repositorios';

export interface RegistrarDocumentoPersonaEntrada {
  personaId: string;
  institucionEducativaId: string;
  tipoDocumentoId: string;
  numero: string;
  codigoPaisEmision?: string | null;
  esPrincipal?: boolean;
  fechaEmision?: Date | null;
  fechaVencimiento?: Date | null;
}

export class RegistrarDocumentoPersonaCasoUso {
  constructor(
    private readonly personas: RepositorioPersonas,
    private readonly documentos: RepositorioDocumentosIdentidadPersona,
  ) {}

  async ejecutar(entrada: RegistrarDocumentoPersonaEntrada): Promise<void> {
    const persona = await this.personas.buscarPorIdEnInstitucion(
      entrada.personaId,
      entrada.institucionEducativaId,
    );
    if (!persona) {
      throw new NotFoundException('PERSONA_NO_ENCONTRADA');
    }
    if (persona.estado === 'BAJA') {
      throw new ConflictException('PERSONA_DADA_DE_BAJA');
    }
    if (
      entrada.fechaVencimiento &&
      entrada.fechaEmision &&
      entrada.fechaVencimiento < entrada.fechaEmision
    ) {
      throw new ConflictException('FECHA_VENCIMIENTO_ANTERIOR_A_EMISION');
    }

    const documentoEntrada: RegistrarDocumentoEntrada = {
      personaId: entrada.personaId,
      institucionEducativaId: entrada.institucionEducativaId,
      tipoDocumentoId: entrada.tipoDocumentoId,
      numero: entrada.numero,
      numeroNormalizado: entrada.numero.trim().toUpperCase(),
      codigoPaisEmision: entrada.codigoPaisEmision ?? null,
      esPrincipal: entrada.esPrincipal ?? false,
      fechaEmision: entrada.fechaEmision ?? null,
      fechaVencimiento: entrada.fechaVencimiento ?? null,
    };

    await this.documentos.registrar(documentoEntrada);
  }
}
