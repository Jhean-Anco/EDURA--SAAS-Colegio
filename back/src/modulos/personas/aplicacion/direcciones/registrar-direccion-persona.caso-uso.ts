import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  RegistrarDireccionEntrada,
  RepositorioDireccionesPersona,
  RepositorioPersonas,
} from '../../dominio/puertos/repositorios';

export interface RegistrarDireccionPersonaEntrada {
  personaId: string;
  institucionEducativaId: string;
  direccionLinea: string;
  referencia?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  ubigeoId?: string | null;
  esPrincipal?: boolean;
}

export class RegistrarDireccionPersonaCasoUso {
  constructor(
    private readonly personas: RepositorioPersonas,
    private readonly direcciones: RepositorioDireccionesPersona,
  ) {}

  async ejecutar(entrada: RegistrarDireccionPersonaEntrada): Promise<void> {
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

    const lat = entrada.latitud ?? null;
    const lon = entrada.longitud ?? null;
    if (lat !== null && (lat < -90 || lat > 90)) {
      throw new ConflictException('LATITUD_FUERA_DE_RANGO');
    }
    if (lon !== null && (lon < -180 || lon > 180)) {
      throw new ConflictException('LONGITUD_FUERA_DE_RANGO');
    }

    const dirEntrada: RegistrarDireccionEntrada = {
      personaId: entrada.personaId,
      institucionEducativaId: entrada.institucionEducativaId,
      direccionLinea: entrada.direccionLinea.trim(),
      referencia: entrada.referencia?.trim() ?? null,
      latitud: lat,
      longitud: lon,
      ubigeoId: entrada.ubigeoId ?? null,
      esPrincipal: entrada.esPrincipal ?? false,
    };

    await this.direcciones.registrar(dirEntrada);
  }
}
