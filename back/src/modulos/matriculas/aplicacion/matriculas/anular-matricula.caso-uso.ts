import { AlcanceAcceso } from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import { MatriculaNoEncontradaError } from '../../dominio/errores-matriculas';

export interface EntradaAnularMatricula {
  motivo: string;
}

export class AnularMatriculaCasoUso {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    id: string,
    entrada: EntradaAnularMatricula,
    alcance: AlcanceAcceso,
    correlacionId?: string,
  ): Promise<{ id: string }> {
    return this.repositorio.ejecutarTransaccion(async (manager) => {
      const matricula = await this.repositorio.buscarPorId(
        id,
        alcance,
        manager,
      );
      if (!matricula) {
        throw new MatriculaNoEncontradaError();
      }

      const estadoAnterior = matricula.estado;
      matricula.anular(alcance.usuarioId, new Date(), entrada.motivo);

      await this.repositorio.guardar(matricula, manager);
      await this.repositorio.registrarHistorialEstado(
        {
          idMatricula: matricula.id,
          estadoAnterior,
          estadoNuevo: 'ANULADA',
          motivo: entrada.motivo,
          idUsuario: alcance.usuarioId,
          fecha: new Date(),
          correlacionId,
        },
        manager,
      );

      return { id: matricula.id };
    });
  }
}
