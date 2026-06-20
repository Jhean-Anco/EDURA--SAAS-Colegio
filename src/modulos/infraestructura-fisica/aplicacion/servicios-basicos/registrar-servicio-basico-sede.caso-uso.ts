import {
  EstadoIncompatibleError,
  RecursoNoEncontradoError,
} from '../../../../compartido/dominio/errores-dominio';
import { ServicioBasicoTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/servicio-basico.typeorm-repositorio';

export interface RegistrarServicioBasicoSedeEntrada {
  id: string;
  sedeId: string;
  tipoServicioCodigo: string;
  proveedor?: string | null;
  numeroSuministro?: string | null;
}

export class RegistrarServicioBasicoSedeCasoUso {
  constructor(private readonly repositorio: ServicioBasicoTypeormRepositorio) {}

  async ejecutar(
    entrada: RegistrarServicioBasicoSedeEntrada,
  ): Promise<
    import('../../infraestructura/persistencia/typeorm/entidades/servicio-basico-sede.typeorm-entidad').ServicioBasicoSedeTypeormEntidad
  > {
    const sedeActiva = await this.repositorio.sedeActiva(entrada.sedeId);
    if (!sedeActiva) {
      throw new EstadoIncompatibleError(
        'La sede debe estar activa para registrar un servicio básico.',
      );
    }
    const tipo = await this.repositorio.buscarTipoActivoPorCodigo(
      entrada.tipoServicioCodigo,
    );
    if (!tipo) {
      throw new RecursoNoEncontradoError(
        'El tipo de servicio básico no existe o está inactivo.',
      );
    }
    return this.repositorio.crear({
      id: entrada.id,
      sedeId: entrada.sedeId,
      tipoServicioBasicoId: tipo.id,
      proveedor: entrada.proveedor ?? null,
      numeroSuministro: entrada.numeroSuministro ?? null,
      estadoServicio: 'ACTIVO',
      fechaInicio: null,
      fechaFin: null,
      observaciones: null,
    });
  }
}
