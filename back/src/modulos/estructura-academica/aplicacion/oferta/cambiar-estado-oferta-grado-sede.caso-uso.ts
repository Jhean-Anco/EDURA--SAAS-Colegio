import {
  AnioAcademicoNoDisponibleError,
  GradoAcademicoNoDisponibleError,
  NivelAcademicoNoDisponibleError,
  OfertaConSeccionesActivasError,
  OfertaGradoSedeNoEncontradaError,
  SedeAcademicaNoDisponibleError,
  TransicionOfertaInvalidaError,
} from '../../dominio/errores-estructura-academica';
import {
  AlcanceAcceso,
  EstadoCalendario,
  EstadoOferta,
  RepositorioOfertaAcademica,
} from '../../dominio/puertos/estructura-academica.puerto';

const TRANSICIONES_OFERTA: Record<EstadoOferta, EstadoOferta[]> = {
  PLANIFICADA: ['ACTIVA', 'CANCELADA'],
  ACTIVA: ['CERRADA', 'CANCELADA'],
  CERRADA: [],
  CANCELADA: [],
};

function validarContextoParaActivar(contexto: {
  estadoSede: string;
  estadoGrado: string;
  estadoNivel: string;
  estadoAnio: EstadoCalendario;
}): void {
  if (contexto.estadoSede !== 'ACTIVA')
    throw new SedeAcademicaNoDisponibleError();
  if (contexto.estadoGrado !== 'ACTIVO')
    throw new GradoAcademicoNoDisponibleError();
  if (contexto.estadoNivel !== 'ACTIVO')
    throw new NivelAcademicoNoDisponibleError();
  if (contexto.estadoAnio !== 'ACTIVO')
    throw new AnioAcademicoNoDisponibleError();
}

export class CambiarEstadoOfertaGradoSedeCasoUso {
  constructor(private readonly repositorio: RepositorioOfertaAcademica) {}

  async ejecutar(
    id: string,
    nuevoEstado: EstadoOferta,
    alcance: AlcanceAcceso,
  ): Promise<void> {
    const oferta = await this.repositorio.obtenerOfertaConContexto(
      id,
      alcance.institucionId,
    );
    if (!oferta) throw new OfertaGradoSedeNoEncontradaError();

    if (
      alcance.ambito === 'SEDE' &&
      alcance.sedeId &&
      oferta.idSede !== alcance.sedeId
    ) {
      throw new OfertaGradoSedeNoEncontradaError();
    }

    const permitidos = TRANSICIONES_OFERTA[oferta.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionOfertaInvalidaError(oferta.estado, nuevoEstado);
    }

    if (nuevoEstado === 'ACTIVA') {
      validarContextoParaActivar(oferta);
    }

    if (nuevoEstado === 'CERRADA' || nuevoEstado === 'CANCELADA') {
      const tieneSecciones =
        await this.repositorio.tieneSeccionesActivasEnOferta(
          id,
          alcance.institucionId,
        );
      if (tieneSecciones) throw new OfertaConSeccionesActivasError();
    }

    await this.repositorio.cambiarEstadoOferta(
      id,
      alcance.institucionId,
      nuevoEstado,
    );
  }
}
