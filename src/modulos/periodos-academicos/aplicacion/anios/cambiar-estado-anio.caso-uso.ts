import { ConflictException, NotFoundException } from '@nestjs/common';
import { EstadoAnioAcademico } from '../../dominio/entidades/anio-academico';
import { RepositorioAniosAcademicos } from '../../dominio/puertos/repositorios';

const TRANSICIONES_VALIDAS: Record<EstadoAnioAcademico, EstadoAnioAcademico[]> =
  {
    PLANIFICADO: ['EN_CURSO', 'ANULADO'],
    EN_CURSO: ['CERRADO', 'ANULADO'],
    CERRADO: [],
    ANULADO: [],
  };

export class CambiarEstadoAnioCasoUso {
  constructor(private readonly repositorio: RepositorioAniosAcademicos) {}

  async ejecutar(
    id: string,
    institucionId: string,
    nuevoEstado: EstadoAnioAcademico,
  ): Promise<void> {
    const anio = await this.repositorio.buscarPorId(id, institucionId);
    if (!anio) {
      throw new NotFoundException('Año académico no encontrado');
    }

    const transicionesPermitidas = TRANSICIONES_VALIDAS[anio.estado];
    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new ConflictException(
        `No se puede pasar de ${anio.estado} a ${nuevoEstado}`,
      );
    }

    await this.repositorio.actualizarEstado(id, institucionId, nuevoEstado);
  }
}
