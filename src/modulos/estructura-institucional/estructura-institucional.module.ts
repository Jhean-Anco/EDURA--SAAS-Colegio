import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanalContactoSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/canal-contacto-sede.typeorm-entidad';
import { HorarioAtencionSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/horario-atencion-sede.typeorm-entidad';
import { IdentidadSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/identidad-sede.typeorm-entidad';
import { PaginaSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/pagina-sede.typeorm-entidad';
import { RecursoIdentidadSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/recurso-identidad-sede.typeorm-entidad';
import { DireccionSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/direccion-sede.typeorm-entidad';
import { InstitucionEducativaTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';
import { SeccionPaginaSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/seccion-pagina-sede.typeorm-entidad';
import { SedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { UbigeoTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/ubigeo.typeorm-entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstitucionEducativaTypeormEntidad,
      SedeTypeormEntidad,
      UbigeoTypeormEntidad,
      DireccionSedeTypeormEntidad,
      IdentidadSedeTypeormEntidad,
      RecursoIdentidadSedeTypeormEntidad,
      CanalContactoSedeTypeormEntidad,
      HorarioAtencionSedeTypeormEntidad,
      PaginaSedeTypeormEntidad,
      SeccionPaginaSedeTypeormEntidad,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EstructuraInstitucionalModule {}
