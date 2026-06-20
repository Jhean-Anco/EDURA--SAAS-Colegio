import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DireccionSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/direccion-sede.typeorm-entidad';
import { InstitucionEducativaTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';
import { SedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { UbigeoTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/ubigeo.typeorm-entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstitucionEducativaTypeormEntidad,
      SedeTypeormEntidad,
      UbigeoTypeormEntidad,
      DireccionSedeTypeormEntidad,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EstructuraInstitucionalModule {}
