import { IsIn } from 'class-validator';

export class CambiarEstadoServicioBasicoSolicitud {
  @IsIn(['ACTIVO', 'SUSPENDIDO', 'INACTIVO', 'BAJA'])
  estadoServicio!: 'ACTIVO' | 'SUSPENDIDO' | 'INACTIVO' | 'BAJA';
}
