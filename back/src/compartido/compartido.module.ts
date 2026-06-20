import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionRolUsuarioTypeormEntidad } from '../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/seguridad.typeorm-entidades';
import {
  CONSULTADOR_PERMISOS_EFECTIVOS,
  ConsultadorPermisosEfectivosTypeorm,
} from './infraestructura/persistencia/consultador-permisos.typeorm';
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
    GuardiaPermisos,
  ],
  exports: [
    ConsultadorPermisosEfectivosTypeorm,
    CONSULTADOR_PERMISOS_EFECTIVOS,
    GuardiaPermisos,
  ],
})
export class CompartidoModule {}
