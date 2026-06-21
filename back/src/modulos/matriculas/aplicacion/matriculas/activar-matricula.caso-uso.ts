import { AlcanceAcceso } from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import {
  MatriculaNoEncontradaError,
  EstudianteConMatriculaActivaError,
  SeccionSinCapacidadError,
  SeccionInactivaError,
  EstructuraAcademicaIncoherenteError,
} from '../../dominio/errores-matriculas';

export class ActivarMatriculaCasoUso {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    id: string,
    alcance: AlcanceAcceso,
    correlacionId?: string,
  ): Promise<{ id: string }> {
    // We execute the whole activation flow inside a database transaction
    return this.repositorio.ejecutarTransaccion(async (manager) => {
      // 1. Obtener matricula
      const matricula = await this.repositorio.buscarPorId(
        id,
        alcance,
        manager,
      );
      if (!matricula) {
        throw new MatriculaNoEncontradaError();
      }

      // 2. Si tiene seccion, verificar capacidad con bloqueo FOR UPDATE en la seccion
      if (matricula.idSeccionAcademica) {
        const seccion = await this.repositorio.obtenerSeccionConBloqueo(
          matricula.idSeccionAcademica,
          manager,
        );
        if (!seccion) {
          throw new EstructuraAcademicaIncoherenteError();
        }
        if (seccion.estado !== 'ACTIVA') {
          throw new SeccionInactivaError();
        }

        if (seccion.capacidadMaxima !== null && seccion.capacidadMaxima > 0) {
          const activas =
            await this.repositorio.contarMatriculasActivasEnSeccion(
              matricula.idSeccionAcademica,
              manager,
            );
          if (activas >= seccion.capacidadMaxima) {
            throw new SeccionSinCapacidadError();
          }
        }
      }

      // 3. RN-MAT-006 / RN-MAT-007: Verificar duplicado activo
      const tieneActiva = await this.repositorio.estudianteTieneMatriculaActiva(
        alcance.institucionId,
        matricula.idEstudiante,
        matricula.idAnioAcademico,
        matricula.id,
        manager,
      );
      if (tieneActiva) {
        throw new EstudianteConMatriculaActivaError();
      }

      // 4. Activar a nivel de dominio
      const estadoAnterior = matricula.estado;
      matricula.activar(alcance.usuarioId, new Date());

      // 5. Guardar matricula e historial
      await this.repositorio.guardar(matricula, manager);
      await this.repositorio.registrarHistorialEstado(
        {
          idMatricula: matricula.id,
          estadoAnterior,
          estadoNuevo: 'ACTIVA',
          motivo: 'Activacion de matricula',
          idUsuario: alcance.usuarioId,
          fecha: new Date(),
          correlacionId,
        },
        manager,
      );

      // Si tiene seccion asignada, registrar primer historial de seccion
      if (matricula.idSeccionAcademica) {
        await this.repositorio.registrarHistorialSeccion(
          {
            idMatricula: matricula.id,
            idSeccionAnterior: null,
            idSeccionNueva: matricula.idSeccionAcademica,
            motivo: 'Asignacion inicial al activar',
            idUsuario: alcance.usuarioId,
            fecha: new Date(),
            correlacionId,
          },
          manager,
        );
      }

      return { id: matricula.id };
    });
  }
}
