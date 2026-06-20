import { Inject } from '@nestjs/common';
import { Sede } from '../../dominio/sedes/sede.entidad';
import {
  REPOSITORIO_SEDES,
  RepositorioSedes,
} from '../../dominio/sedes/repositorio-sedes.puerto';

export interface CrearSedeEntrada {
  id: string;
  institucionId: string;
  codigo: string;
  nombre: string;
  institucionActiva: boolean;
}

export class CrearSedeCasoUso {
  constructor(
    @Inject(REPOSITORIO_SEDES)
    private readonly repositorio: RepositorioSedes,
  ) {}

  async ejecutar(entrada: CrearSedeEntrada): Promise<{ id: string }> {
    const sede = Sede.crear(entrada);
    await this.repositorio.guardar(sede);
    return { id: sede.id };
  }
}
