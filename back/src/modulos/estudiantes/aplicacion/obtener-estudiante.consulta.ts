import { EstudiantesConsulta } from '../dominio/puertos/estudiantes.puerto';
import { EstudianteNoEncontradoError } from '../dominio/errores-estudiantes';

export class ObtenerEstudianteConsulta {
  constructor(private readonly consulta: EstudiantesConsulta) {}
  async ejecutar(id: string, institucionId: string) {
    const estudiante = await this.consulta.obtener(id, institucionId);
    if (!estudiante) {
      throw new EstudianteNoEncontradoError();
    }
    return estudiante;
  }
}
