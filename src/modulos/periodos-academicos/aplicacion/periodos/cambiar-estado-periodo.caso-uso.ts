import { ConflictException, NotFoundException } from '@nestjs/common';
import { EstadoPeriodoAcademico } from '../../dominio/entidades/periodo-academico';
import { RepositorioPeriodosAcademicos } from '../../dominio/puertos/repositorios';

const TRANSICIONES_VALIDAS: Record<
  EstadoPeriodoAcademico,
  EstadoPeriodoAcademico[]
> = {
  PLANIFICADO: ['EN_CURSO', 'ANULADO'],
  EN_CURSO: ['CERRADO', 'ANULADO'],
  CERRADO: [],
  ANULADO: [],
};

export class CambiarEstadoPeriodoCasoUso {
  constructor(private readonly repositorio: RepositorioPeriodosAcademicos) {}

  async ejecutar(
    id: string,
    institucionId: string,
    nuevoEstado: EstadoPeriodoAcademico,
  ): Promise<void> {
    const periodo = await this.repositorio.buscarPorId(id, institucionId);
    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    const permitidos = TRANSICIONES_VALIDAS[periodo.estado];
    if (!permitidos.includes(nuevoEstado)) {
      throw new ConflictException(
        `No se puede pasar de ${periodo.estado} a ${nuevoEstado}`,
      );
    }

    await this.repositorio.actualizarEstado(id, institucionId, nuevoEstado);
  }
}
