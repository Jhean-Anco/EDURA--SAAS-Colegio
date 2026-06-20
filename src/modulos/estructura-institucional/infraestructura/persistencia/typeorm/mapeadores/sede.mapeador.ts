import { Sede } from '../../../../dominio/sedes/sede.entidad';
import { SedeTypeormEntidad } from '../entidades/sede.typeorm-entidad';

export class SedeMapeador {
  static aDominio(entidad: SedeTypeormEntidad): Sede {
    return Sede.reconstruir({
      id: entidad.id,
      institucionId: entidad.institucionEducativaId,
      codigo: entidad.codigo,
      nombre: entidad.nombre,
      esPrincipal: entidad.esPrincipal,
      estado: entidad.estado as 'ACTIVA' | 'INACTIVA' | 'BAJA',
    });
  }
}
