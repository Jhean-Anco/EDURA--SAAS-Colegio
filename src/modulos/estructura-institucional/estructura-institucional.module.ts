import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrearInstitucionCasoUso } from './aplicacion/instituciones/crear-institucion.caso-uso';
import { ListarInstitucionesConsulta } from './aplicacion/instituciones/listar-instituciones.consulta';
import { ObtenerInstitucionConsulta } from './aplicacion/instituciones/obtener-institucion.consulta';
import { CrearSedeCasoUso } from './aplicacion/sedes/crear-sede.caso-uso';
import { ListarSedesInstitucionConsulta } from './aplicacion/sedes/listar-sedes-institucion.consulta';
import { ObtenerSedeConsulta } from './aplicacion/sedes/obtener-sede.consulta';
import { CONSULTADOR_SEDES } from './dominio/sedes/consultador-sedes.puerto';
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
import { ConsultadorSedesTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/consultador-sedes.typeorm-consulta';
import { InstitucionTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/institucion.typeorm-repositorio';
import { SedeTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/sede.typeorm-repositorio';
import { REPOSITORIO_INSTITUCIONES } from './dominio/instituciones/repositorio-instituciones.puerto';
import { REPOSITORIO_SEDES } from './dominio/sedes/repositorio-sedes.puerto';
import { InstitucionesControlador } from './presentacion/http/controladores/instituciones.controlador';
import { SedesControlador } from './presentacion/http/controladores/sedes.controlador';

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
  providers: [
    CrearInstitucionCasoUso,
    CrearSedeCasoUso,
    ListarInstitucionesConsulta,
    ObtenerInstitucionConsulta,
    ListarSedesInstitucionConsulta,
    ObtenerSedeConsulta,
    InstitucionTypeormRepositorio,
    SedeTypeormRepositorio,
    ConsultadorSedesTypeormConsulta,
    {
      provide: REPOSITORIO_INSTITUCIONES,
      useExisting: InstitucionTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_SEDES,
      useExisting: SedeTypeormRepositorio,
    },
    {
      provide: CONSULTADOR_SEDES,
      useExisting: ConsultadorSedesTypeormConsulta,
    },
  ],
  controllers: [InstitucionesControlador, SedesControlador],
  exports: [CONSULTADOR_SEDES],
})
export class EstructuraInstitucionalModule {}
