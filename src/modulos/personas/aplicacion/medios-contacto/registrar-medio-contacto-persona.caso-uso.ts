import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  RegistrarMedioContactoEntrada,
  RepositorioMediosContactoPersona,
  RepositorioPersonas,
} from '../../dominio/puertos/repositorios';

type TipoContacto = 'CORREO' | 'CELULAR' | 'TELEFONO' | 'OTRO';

export interface RegistrarMedioContactoPersonaEntrada {
  personaId: string;
  institucionEducativaId: string;
  tipo: TipoContacto;
  valor: string;
  esPrincipal?: boolean;
}

export class RegistrarMedioContactoPersonaCasoUso {
  constructor(
    private readonly personas: RepositorioPersonas,
    private readonly contactos: RepositorioMediosContactoPersona,
  ) {}

  async ejecutar(entrada: RegistrarMedioContactoPersonaEntrada): Promise<void> {
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

    const valorNormalizado = this.normalizar(entrada.tipo, entrada.valor);

    const contactoEntrada: RegistrarMedioContactoEntrada = {
      personaId: entrada.personaId,
      institucionEducativaId: entrada.institucionEducativaId,
      tipo: entrada.tipo,
      valor: entrada.valor,
      valorNormalizado,
      esPrincipal: entrada.esPrincipal ?? false,
    };

    await this.contactos.registrar(contactoEntrada);
  }

  private normalizar(tipo: TipoContacto, valor: string): string {
    if (tipo === 'CORREO') {
      return valor.trim().toLowerCase();
    }
    return valor.trim().replace(/\s+/g, '');
  }
}
