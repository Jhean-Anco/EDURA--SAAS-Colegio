import { InstitucionEducativa } from '../../../../dominio/instituciones/institucion-educativa.entidad';
import { InstitucionEducativaTypeormEntidad } from '../entidades/institucion-educativa.typeorm-entidad';

export class InstitucionEducativaMapeador {
  static aDominio(
    entidad: InstitucionEducativaTypeormEntidad,
  ): InstitucionEducativa {
    return InstitucionEducativa.reconstruir({
      id: entidad.id,
      codigo: entidad.codigo,
      nombreLegal: entidad.nombreLegal,
      nombreCorto: entidad.nombreCorto ?? null,
      tipoGestion: entidad.tipoGestion ?? null,
      estado: entidad.estado as 'ACTIVA' | 'INACTIVA' | 'BAJA',
    });
  }
}
