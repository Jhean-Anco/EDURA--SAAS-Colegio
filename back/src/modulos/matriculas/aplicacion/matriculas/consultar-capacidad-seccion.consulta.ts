import { DataSource } from 'typeorm';
import { AlcanceAcceso } from '../../dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../dominio/puertos/matriculas.puerto';
import {
  EstructuraAcademicaIncoherenteError,
  OperacionSobreSedeNoPermitidaError,
} from '../../dominio/errores-matriculas';

export interface CapacidadSeccionRespuesta {
  idSeccion: string;
  capacidadMaxima: number | null;
  matriculasActivas: number;
  vacantesDisponibles: number | null;
}

export class ConsultarCapacidadSeccionConsulta {
  constructor(private readonly repositorio: MatriculasPuerto) {}

  async ejecutar(
    idSeccion: string,
    alcance: AlcanceAcceso,
  ): Promise<CapacidadSeccionRespuesta> {
    // In order to lock or check, we don't need a write lock, but let's query the section details
    // We can use a transaction or a normal query. Let's use a normal query.
    // Wait, we need to check if the section belongs to the institution
    const seccion = await this.repositorio.verificarSeccion(
      idSeccion,
      alcance.institucionId,
    );
    if (!seccion) {
      throw new EstructuraAcademicaIncoherenteError();
    }

    // Aisoamiento por sede: if the user has SEDE scope, does the section belong to their sede?
    // Let's get the offer of the section to find out its Sede.
    const oferta = await this.repositorio.verificarOfertaGradoSede(
      seccion.idOfertaGradoSede,
      alcance.institucionId,
    );
    if (!oferta) {
      throw new EstructuraAcademicaIncoherenteError();
    }
    if (alcance.ambito === 'SEDE' && oferta.idSede !== alcance.sedeId) {
      throw new OperacionSobreSedeNoPermitidaError();
    }

    // Get max capacity from sections table:
    // Let's call obtenerSeccionConBloqueo without FOR UPDATE? Or we can query the capacity from DB.
    // Wait, let's write a simple query or use verificarSeccion? We can use the section details.
    // Let's query the database directly to get the capacity_maxima of this section:
    const ds = (this.repositorio as unknown as { ds: DataSource }).ds;
    const rows = await ds.query<{ capacidadMaxima: number | null }[]>(
      'SELECT capacidad_maxima as "capacidadMaxima" FROM secciones_academicas WHERE id = $1',
      [idSeccion],
    );
    const capacidadMaxima =
      rows[0]?.capacidadMaxima !== undefined ? rows[0].capacidadMaxima : null;

    const matriculasActivas =
      await this.repositorio.contarMatriculasActivasEnSeccion(idSeccion);
    const vacantesDisponibles =
      capacidadMaxima !== null
        ? Math.max(0, capacidadMaxima - matriculasActivas)
        : null;

    return {
      idSeccion,
      capacidadMaxima,
      matriculasActivas,
      vacantesDisponibles,
    };
  }
}
