import {
  ApoderadoPrincipalExistenteError,
  EstudianteNoEncontradoError,
} from '../dominio/errores-estudiantes';
import { RepositorioEstudiantes } from '../dominio/puertos/estudiantes.puerto';

export class ActualizarApoderadoEstudianteCasoUso {
  constructor(private readonly repositorio: RepositorioEstudiantes) {}

  async ejecutar(entrada: {
    institucionId: string;
    estudianteId: string;
    idApoderado: string;
    parentesco?: string;
    esPrincipal?: boolean;
    puedeRecoger?: boolean;
    recibeComunicaciones?: boolean;
    estado?: string;
  }): Promise<void> {
    const apoderado = await this.repositorio.obtenerApoderadoBase(
      entrada.idApoderado,
      entrada.estudianteId,
      entrada.institucionId,
    );
    if (!apoderado) throw new EstudianteNoEncontradoError();

    if (entrada.esPrincipal === true && !apoderado.esPrincipal) {
      const hayPrincipal = await this.repositorio.apoderadoPrincipalActivo(
        entrada.estudianteId,
        entrada.institucionId,
        entrada.idApoderado,
      );
      if (hayPrincipal) throw new ApoderadoPrincipalExistenteError();
    }

    await this.repositorio.actualizarApoderado({
      idApoderado: entrada.idApoderado,
      estudianteId: entrada.estudianteId,
      institucionId: entrada.institucionId,
      parentesco: entrada.parentesco ?? null,
      esPrincipal: entrada.esPrincipal ?? null,
      puedeRecoger: entrada.puedeRecoger ?? null,
      recibeComunicaciones: entrada.recibeComunicaciones ?? null,
      estado: entrada.estado ?? null,
    });
  }
}
