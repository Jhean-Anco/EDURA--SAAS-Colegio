import {
  EstadoIncompatibleError,
  RecursoNoEncontradoError,
} from '../../../../compartido/dominio/errores-dominio';
import { CrearServicioBasicoEntrada } from '../../dominio/servicios-basicos/repositorio-servicios-basicos.puerto';
import { ServicioBasicoSedeRespuesta } from '../../dominio/servicios-basicos/servicio-basico.respuesta';
import { RepositorioServiciosBasicos } from './puertos';

export interface RegistrarServicioBasicoSedeEntrada {
  id: string;
  sedeId: string;
  tipoServicioCodigo: string;
  proveedor?: string | null;
  numeroSuministro?: string | null;
}

export class RegistrarServicioBasicoSedeCasoUso {
  constructor(private readonly repositorio: RepositorioServiciosBasicos) {}

  async ejecutar(
    entrada: RegistrarServicioBasicoSedeEntrada,
  ): Promise<ServicioBasicoSedeRespuesta> {
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
    const entradaPersistencia: CrearServicioBasicoEntrada = {
      id: entrada.id,
      sedeId: entrada.sedeId,
      tipoServicioBasicoId: tipo.id,
      proveedor: entrada.proveedor ?? null,
      numeroSuministro: entrada.numeroSuministro ?? null,
      estadoServicio: 'ACTIVO',
      fechaInicio: null,
      fechaFin: null,
      observaciones: null,
    };
    return this.repositorio.crear(entradaPersistencia);
  }
}
