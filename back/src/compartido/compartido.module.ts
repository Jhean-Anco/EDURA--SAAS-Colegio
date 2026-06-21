import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionRolUsuarioTypeormEntidad } from '../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/seguridad.typeorm-entidades';
import {
  CONSULTADOR_PERMISOS_EFECTIVOS,
  ConsultadorPermisosEfectivosTypeorm,
} from './infraestructura/persistencia/consultador-permisos.typeorm';
import { AuditoriaTypeorm } from './infraestructura/persistencia/auditoria.typeorm';
import { SERVICIO_AUDITORIA } from './aplicacion/auditoria.puerto';
import { GuardiaPermisos } from './presentacion/http/guardias/guardia-permisos';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AsignacionRolUsuarioTypeormEntidad])],
  providers: [
    ConsultadorPermisosEfectivosTypeorm,
    {
      provide: CONSULTADOR_PERMISOS_EFECTIVOS,
      useExisting: ConsultadorPermisosEfectivosTypeorm,
    },
    AuditoriaTypeorm,
    {
      provide: SERVICIO_AUDITORIA,
      useExisting: AuditoriaTypeorm,
    },
    GuardiaPermisos,
  ],
  exports: [
    ConsultadorPermisosEfectivosTypeorm,
    CONSULTADOR_PERMISOS_EFECTIVOS,
    AuditoriaTypeorm,
    SERVICIO_AUDITORIA,
    GuardiaPermisos,
  ],
})
export class CompartidoModule {}
