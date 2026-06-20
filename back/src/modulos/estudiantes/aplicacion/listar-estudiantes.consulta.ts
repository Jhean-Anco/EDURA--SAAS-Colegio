import {
  EstudiantesConsulta,
  ListadoEstudiantesEntrada,
} from '../dominio/puertos/estudiantes.puerto';
export class ListarEstudiantesConsulta {
  constructor(private readonly consulta: EstudiantesConsulta) {}
  ejecutar(entrada: ListadoEstudiantesEntrada) {
    return this.consulta.listar(entrada);
  }
}
