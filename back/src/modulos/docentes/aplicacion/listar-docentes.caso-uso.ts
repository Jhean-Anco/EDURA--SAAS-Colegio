import {
  AlcanceAcceso,
  ConsultadorDocentes,
  DocenteResumen,
} from '../dominio/puertos/docentes.puerto';

export class ListarDocentesCasoUso {
  constructor(private readonly consultador: ConsultadorDocentes) {}

  async ejecutar(entrada: {
    alcance: AlcanceAcceso;
    idSede?: string | null;
    idEspecialidad?: string | null;
    estado?: string | null;
    busqueda?: string | null;
    pagina: number;
    limite: number;
  }): Promise<{ datos: DocenteResumen[]; total: number }> {
    const idSede =
      entrada.alcance.ambito === 'SEDE'
        ? (entrada.alcance.sedeId ?? null)
        : (entrada.idSede ?? null);

    return this.consultador.listar({
      alcance: entrada.alcance,
      idSede: idSede ?? null,
      idEspecialidad: entrada.idEspecialidad ?? null,
      estado: entrada.estado ?? null,
      busqueda: entrada.busqueda ?? null,
      pagina: entrada.pagina,
      limite: Math.min(entrada.limite, 100),
    });
  }
}
