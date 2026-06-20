import { Persona } from '../../dominio/personas/persona';
import { RepositorioPersonas } from '../../dominio/puertos/repositorios';
import { randomUUID } from 'node:crypto';

export interface CrearPersonaEntrada {
  institucionEducativaId: string;
  nombres: string;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  fechaNacimiento?: Date | null;
  sexoRegistral?: string | null;
  codigoPaisNacionalidad?: string | null;
}

export class CrearPersonaCasoUso {
  constructor(private readonly personas: RepositorioPersonas) {}

  ejecutar(entrada: CrearPersonaEntrada): Promise<Persona> {
    const persona = new Persona(
      randomUUID(),
      entrada.institucionEducativaId,
      entrada.nombres.trim(),
      entrada.apellidoPaterno?.trim() || null,
      entrada.apellidoMaterno?.trim() || null,
      entrada.fechaNacimiento ?? null,
      entrada.sexoRegistral ?? null,
      entrada.codigoPaisNacionalidad ?? null,
      'ACTIVA',
      new Date(),
      new Date(),
    );
    return this.personas.crear(persona);
  }
}
