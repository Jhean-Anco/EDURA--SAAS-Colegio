import { EstudiantesConsulta } from '../dominio/puertos/estudiantes.puerto';
export class ObtenerEstudianteConsulta {
  constructor(private readonly consulta: EstudiantesConsulta) {}
  ejecutar(id: string, institucionId: string) {
    return this.consulta.obtener(id, institucionId);
  }
}
