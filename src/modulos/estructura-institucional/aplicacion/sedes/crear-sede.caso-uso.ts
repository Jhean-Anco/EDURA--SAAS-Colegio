import {
  CodigoDuplicadoError,
  EstadoIncompatibleError,
  RecursoNoEncontradoError,
} from '../../../../compartido/dominio/errores-dominio';
import { Sede } from '../../dominio/sedes/sede.entidad';
import { InstitucionTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/institucion.typeorm-repositorio';
import { SedeTypeormRepositorio } from '../../infraestructura/persistencia/typeorm/repositorios/sede.typeorm-repositorio';

export interface CrearSedeEntrada {
  id: string;
  institucionId: string;
  codigo: string;
  nombre: string;
}

export interface CrearSedeSalida {
  id: string;
  institucionId: string;
  codigo: string;
  nombre: string;
  esPrincipal: boolean;
  estado: 'ACTIVA' | 'INACTIVA' | 'BAJA';
}

export class CrearSedeCasoUso {
  constructor(
    private readonly instituciones: InstitucionTypeormRepositorio,
    private readonly repositorio: SedeTypeormRepositorio,
  ) {}

  async ejecutar(entrada: CrearSedeEntrada): Promise<CrearSedeSalida> {
    const codigo = entrada.codigo.trim().toUpperCase();
    const institucion = await this.instituciones.buscarPorId(
      entrada.institucionId,
    );
    if (!institucion) {
      throw new RecursoNoEncontradoError(
        'La institucion solicitada no existe.',
      );
    }
    if (institucion.estado !== 'ACTIVA') {
      throw new EstadoIncompatibleError(
        'La institucion debe estar activa para crear una sede.',
      );
    }
    const existe = await this.repositorio.buscarPorInstitucionYCodigo(
      entrada.institucionId,
      codigo,
    );
    if (existe) {
      throw new CodigoDuplicadoError('El codigo de sede ya existe.');
    }
    const sede = Sede.crear({ ...entrada, codigo });
    const sedesExistentes = await this.repositorio.listarPorInstitucion(
      entrada.institucionId,
    );
    if (sedesExistentes.length === 0) {
      sede.establecerPrincipal();
    }
    await this.repositorio.guardar(sede);
    return {
      id: sede.id,
      institucionId: sede.institucionId,
      codigo: sede.codigo,
      nombre: sede.nombre,
      esPrincipal: sede.esPrincipal,
      estado: sede.estado,
    };
  }
}
