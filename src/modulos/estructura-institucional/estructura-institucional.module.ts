import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrearInstitucionCasoUso } from './aplicacion/instituciones/crear-institucion.caso-uso';
import { ActualizarInstitucionCasoUso } from './aplicacion/instituciones/actualizar-institucion.caso-uso';
import { CambiarEstadoInstitucionCasoUso } from './aplicacion/instituciones/cambiar-estado-institucion.caso-uso';
import { ListarInstitucionesConsulta } from './aplicacion/instituciones/listar-instituciones.consulta';
import { ObtenerInstitucionConsulta } from './aplicacion/instituciones/obtener-institucion.consulta';
import { CrearSedeCasoUso } from './aplicacion/sedes/crear-sede.caso-uso';
import { ActualizarSedeCasoUso } from './aplicacion/sedes/actualizar-sede.caso-uso';
import { CambiarEstadoSedeCasoUso } from './aplicacion/sedes/cambiar-estado-sede.caso-uso';
import { EstablecerSedePrincipalCasoUso } from './aplicacion/sedes/establecer-sede-principal.caso-uso';
import { ListarSedesInstitucionConsulta } from './aplicacion/sedes/listar-sedes-institucion.consulta';
import { ObtenerSedeConsulta } from './aplicacion/sedes/obtener-sede.consulta';
import { RegistrarDireccionSedeCasoUso } from './aplicacion/direcciones-sede/registrar-direccion-sede.caso-uso';
import { ListarUbigeosConsulta } from './aplicacion/ubigeos/listar-ubigeos.consulta';
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
import { DireccionTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/direccion.typeorm-repositorio';
import { ContactoTypeormConsulta } from './infraestructura/persistencia/typeorm/repositorios/contacto.typeorm-consulta';
import { HorarioTypeormConsulta } from './infraestructura/persistencia/typeorm/repositorios/horario.typeorm-consulta';
import { IdentidadTypeormConsulta } from './infraestructura/persistencia/typeorm/repositorios/identidad.typeorm-consulta';
import { InstitucionTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/institucion.typeorm-repositorio';
import { SedeTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/sede.typeorm-repositorio';
import { REPOSITORIO_INSTITUCIONES } from './dominio/instituciones/repositorio-instituciones.puerto';
import { REPOSITORIO_SEDES } from './dominio/sedes/repositorio-sedes.puerto';
import { InstitucionesControlador } from './presentacion/http/controladores/instituciones.controlador';
import { DireccionesControlador } from './presentacion/http/controladores/direcciones.controlador';
import { IdentidadControlador } from './presentacion/http/controladores/identidad.controlador';
import { ContactosControlador } from './presentacion/http/controladores/contactos.controlador';
import { HorariosControlador } from './presentacion/http/controladores/horarios.controlador';
import { PaginasControlador } from './presentacion/http/controladores/paginas.controlador';
import { RecursosIdentidadControlador } from './presentacion/http/controladores/recursos-identidad.controlador';
import { SedesControlador } from './presentacion/http/controladores/sedes.controlador';
import { UbigeosControlador } from './presentacion/http/controladores/ubigeos.controlador';
import { PaginaTypeormConsulta } from './infraestructura/persistencia/typeorm/repositorios/pagina.typeorm-consulta';
import { PaginaTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/pagina.typeorm-repositorio';

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
    ActualizarInstitucionCasoUso,
    CambiarEstadoInstitucionCasoUso,
    CrearSedeCasoUso,
    ActualizarSedeCasoUso,
    EstablecerSedePrincipalCasoUso,
    CambiarEstadoSedeCasoUso,
    ListarInstitucionesConsulta,
    ObtenerInstitucionConsulta,
    ListarSedesInstitucionConsulta,
    ObtenerSedeConsulta,
    RegistrarDireccionSedeCasoUso,
    ListarUbigeosConsulta,
    InstitucionTypeormRepositorio,
    SedeTypeormRepositorio,
    DireccionTypeormRepositorio,
    ContactoTypeormConsulta,
    HorarioTypeormConsulta,
    IdentidadTypeormConsulta,
    PaginaTypeormConsulta,
    PaginaTypeormRepositorio,
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
  controllers: [
    InstitucionesControlador,
    SedesControlador,
    DireccionesControlador,
    IdentidadControlador,
    ContactosControlador,
    HorariosControlador,
    PaginasControlador,
    RecursosIdentidadControlador,
    UbigeosControlador,
  ],
  exports: [CONSULTADOR_SEDES],
})
export class EstructuraInstitucionalModule {}
