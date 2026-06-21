import { AlcanceAcceso } from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import {
  MatriculaNoEncontradaError,
  SeccionSinCapacidadError,
  SeccionInactivaError,
  EstructuraAcademicaIncoherenteError,
  EdicionBorradorSoloPermitidaError,
} from '../../dominio/errores-matriculas';

export interface EntradaCambiarSeccion {
  idSeccionNueva: string;
  motivo: string;
}

export class CambiarSeccionCasoUso {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    id: string,
    entrada: EntradaCambiarSeccion,
    alcance: AlcanceAcceso,
    correlacionId?: string,
  ): Promise<{ id: string }> {
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

      // Solo permitir cambiar seccion si esta ACTIVA o BORRADOR
      if (matricula.estado !== 'ACTIVA' && matricula.estado !== 'BORRADOR') {
        throw new EdicionBorradorSoloPermitidaError();
      }

      const idSeccionAnterior = matricula.idSeccionAcademica;
      const idSeccionNueva = entrada.idSeccionNueva;

      if (idSeccionAnterior === idSeccionNueva) {
        return { id: matricula.id };
      }

      // 2. Obtener y bloquear la nueva seccion
      const seccion = await this.repositorio.obtenerSeccionConBloqueo(
        idSeccionNueva,
        manager,
      );
      if (!seccion) {
        throw new EstructuraAcademicaIncoherenteError();
      }
      if (seccion.estado !== 'ACTIVA') {
        throw new SeccionInactivaError();
      }

      // 3. RN-MAT-016: Coherencia de sede, año, grado y oferta
      if (
        seccion.idSede !== matricula.idSede ||
        seccion.idAnioAcademico !== matricula.idAnioAcademico ||
        seccion.idGradoEducativo !== matricula.idGradoEducativo ||
        seccion.idOfertaGradoSede !== matricula.idOfertaGradoSede
      ) {
        throw new EstructuraAcademicaIncoherenteError();
      }

      // 4. RN-MAT-009 / RN-MAT-015: Verificar capacidad en la nueva seccion si la matricula esta ACTIVA
      if (matricula.estado === 'ACTIVA') {
        if (seccion.capacidadMaxima !== null && seccion.capacidadMaxima > 0) {
          const activas =
            await this.repositorio.contarMatriculasActivasEnSeccion(
              idSeccionNueva,
              manager,
            );
          if (activas >= seccion.capacidadMaxima) {
            throw new SeccionSinCapacidadError();
          }
        }
      }

      // 5. Aplicar cambio a nivel de dominio
      matricula.cambiarSeccion(idSeccionNueva);

      // 6. Guardar e registrar historial
      await this.repositorio.guardar(matricula, manager);
      await this.repositorio.registrarHistorialSeccion(
        {
          idMatricula: matricula.id,
          idSeccionAnterior,
          idSeccionNueva,
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
