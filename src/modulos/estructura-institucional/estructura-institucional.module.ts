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
import {
  AgregarSeccionPaginaCasoUso,
  ArchivarPaginaCasoUso,
  CambiarEstadoSeccionCasoUso,
  CrearPaginaSedeCasoUso,
  ListarPaginasSedeConsulta,
  ObtenerPaginaSedeConsulta,
  PublicarPaginaCasoUso,
  RestaurarPaginaCasoUso,
} from './aplicacion/paginas/consultas-paginas';
import { ObtenerIdentidadSedeConsulta } from './aplicacion/identidad/obtener-identidad-sede.consulta';
import { ListarContactosSedeConsulta } from './aplicacion/contactos/listar-contactos-sede.consulta';
import { ListarHorariosSedeConsulta } from './aplicacion/horarios/listar-horarios-sede.consulta';
import {
  RepositorioInstituciones,
  REPOSITORIO_INSTITUCIONES,
} from './dominio/instituciones/repositorio-instituciones.puerto';
import {
  RepositorioSedes,
  REPOSITORIO_SEDES,
} from './dominio/sedes/repositorio-sedes.puerto';
import { CONSULTADOR_SEDES } from './dominio/sedes/consultador-sedes.puerto';
import {
  CONSULTADOR_UBIGEOS,
  ConsultadorUbigeos,
} from './dominio/ubigeos/consultador-ubigeos.puerto';
import {
  REPOSITORIO_DIRECCIONES,
  RepositorioDirecciones,
} from './dominio/direcciones-sede/repositorio-direcciones.puerto';
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
import { UbigeoTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/ubigeo.typeorm-consulta';
import { RecursoIdentidadTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/recurso-identidad.typeorm-consulta';
import { DireccionTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/direccion.typeorm-repositorio';
import { ContactoTypeormConsulta } from './infraestructura/persistencia/typeorm/repositorios/contacto.typeorm-consulta';
import { HorarioTypeormConsulta } from './infraestructura/persistencia/typeorm/repositorios/horario.typeorm-consulta';
import { IdentidadTypeormConsulta } from './infraestructura/persistencia/typeorm/repositorios/identidad.typeorm-consulta';
import { InstitucionTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/institucion.typeorm-repositorio';
import { SedeTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/sede.typeorm-repositorio';
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
import { ListarRecursosIdentidadConsulta } from './aplicacion/identidad/listar-recursos-identidad.consulta';

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
    InstitucionTypeormRepositorio,
    SedeTypeormRepositorio,
    DireccionTypeormRepositorio,
    ContactoTypeormConsulta,
    HorarioTypeormConsulta,
    IdentidadTypeormConsulta,
    PaginaTypeormConsulta,
    PaginaTypeormRepositorio,
    UbigeoTypeormConsulta,
    ConsultadorSedesTypeormConsulta,
    RecursoIdentidadTypeormConsulta,
    {
      provide: REPOSITORIO_INSTITUCIONES,
      useExisting: InstitucionTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_SEDES,
      useExisting: SedeTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_DIRECCIONES,
      useExisting: DireccionTypeormRepositorio,
    },
    {
      provide: CONSULTADOR_UBIGEOS,
      useExisting: UbigeoTypeormConsulta,
    },
    {
      provide: ObtenerIdentidadSedeConsulta,
      useFactory: (consultador: IdentidadTypeormConsulta) =>
        new ObtenerIdentidadSedeConsulta(consultador),
      inject: [IdentidadTypeormConsulta],
    },
    {
      provide: ListarContactosSedeConsulta,
      useFactory: (consultador: ContactoTypeormConsulta) =>
        new ListarContactosSedeConsulta(consultador),
      inject: [ContactoTypeormConsulta],
    },
    {
      provide: ListarHorariosSedeConsulta,
      useFactory: (consultador: HorarioTypeormConsulta) =>
        new ListarHorariosSedeConsulta(consultador),
      inject: [HorarioTypeormConsulta],
    },
    {
      provide: CrearPaginaSedeCasoUso,
      useFactory: (repositorio: PaginaTypeormRepositorio) =>
        new CrearPaginaSedeCasoUso(repositorio),
      inject: [PaginaTypeormRepositorio],
    },
    {
      provide: ListarPaginasSedeConsulta,
      useFactory: (consultador: PaginaTypeormConsulta) =>
        new ListarPaginasSedeConsulta(consultador),
      inject: [PaginaTypeormConsulta],
    },
    {
      provide: ObtenerPaginaSedeConsulta,
      useFactory: (consultador: PaginaTypeormConsulta) =>
        new ObtenerPaginaSedeConsulta(consultador),
      inject: [PaginaTypeormConsulta],
    },
    {
      provide: AgregarSeccionPaginaCasoUso,
      useFactory: (repositorio: PaginaTypeormRepositorio) =>
        new AgregarSeccionPaginaCasoUso(repositorio),
      inject: [PaginaTypeormRepositorio],
    },
    {
      provide: PublicarPaginaCasoUso,
      useFactory: (repositorio: PaginaTypeormRepositorio) =>
        new PublicarPaginaCasoUso(repositorio),
      inject: [PaginaTypeormRepositorio],
    },
    {
      provide: ArchivarPaginaCasoUso,
      useFactory: (repositorio: PaginaTypeormRepositorio) =>
        new ArchivarPaginaCasoUso(repositorio),
      inject: [PaginaTypeormRepositorio],
    },
    {
      provide: RestaurarPaginaCasoUso,
      useFactory: (repositorio: PaginaTypeormRepositorio) =>
        new RestaurarPaginaCasoUso(repositorio),
      inject: [PaginaTypeormRepositorio],
    },
    {
      provide: CambiarEstadoSeccionCasoUso,
      useFactory: (repositorio: PaginaTypeormRepositorio) =>
        new CambiarEstadoSeccionCasoUso(repositorio),
      inject: [PaginaTypeormRepositorio],
    },
    {
      provide: CrearInstitucionCasoUso,
      useFactory: (repositorio: RepositorioInstituciones) =>
        new CrearInstitucionCasoUso(repositorio),
      inject: [REPOSITORIO_INSTITUCIONES],
    },
    {
      provide: ActualizarInstitucionCasoUso,
      useFactory: (repositorio: RepositorioInstituciones) =>
        new ActualizarInstitucionCasoUso(repositorio),
      inject: [REPOSITORIO_INSTITUCIONES],
    },
    {
      provide: CambiarEstadoInstitucionCasoUso,
      useFactory: (repositorio: RepositorioInstituciones) =>
        new CambiarEstadoInstitucionCasoUso(repositorio),
      inject: [REPOSITORIO_INSTITUCIONES],
    },
    {
      provide: ListarInstitucionesConsulta,
      useFactory: (repositorio: RepositorioInstituciones) =>
        new ListarInstitucionesConsulta(repositorio),
      inject: [REPOSITORIO_INSTITUCIONES],
    },
    {
      provide: ObtenerInstitucionConsulta,
      useFactory: (repositorio: RepositorioInstituciones) =>
        new ObtenerInstitucionConsulta(repositorio),
      inject: [REPOSITORIO_INSTITUCIONES],
    },
    {
      provide: CrearSedeCasoUso,
      useFactory: (
        instituciones: RepositorioInstituciones,
        sedes: RepositorioSedes,
      ) => new CrearSedeCasoUso(instituciones, sedes),
      inject: [REPOSITORIO_INSTITUCIONES, REPOSITORIO_SEDES],
    },
    {
      provide: ActualizarSedeCasoUso,
      useFactory: (repositorio: RepositorioSedes) =>
        new ActualizarSedeCasoUso(repositorio),
      inject: [REPOSITORIO_SEDES],
    },
    {
      provide: EstablecerSedePrincipalCasoUso,
      useFactory: (repositorio: RepositorioSedes) =>
        new EstablecerSedePrincipalCasoUso(repositorio),
      inject: [REPOSITORIO_SEDES],
    },
    {
      provide: CambiarEstadoSedeCasoUso,
      useFactory: (repositorio: RepositorioSedes) =>
        new CambiarEstadoSedeCasoUso(repositorio),
      inject: [REPOSITORIO_SEDES],
    },
    {
      provide: ListarSedesInstitucionConsulta,
      useFactory: (repositorio: RepositorioSedes) =>
        new ListarSedesInstitucionConsulta(repositorio),
      inject: [REPOSITORIO_SEDES],
    },
    {
      provide: ObtenerSedeConsulta,
      useFactory: (repositorio: RepositorioSedes) =>
        new ObtenerSedeConsulta(repositorio),
      inject: [REPOSITORIO_SEDES],
    },
    {
      provide: RegistrarDireccionSedeCasoUso,
      useFactory: (
        sedes: RepositorioSedes,
        direcciones: RepositorioDirecciones,
      ) => new RegistrarDireccionSedeCasoUso(sedes, direcciones),
      inject: [REPOSITORIO_SEDES, REPOSITORIO_DIRECCIONES],
    },
    {
      provide: ListarUbigeosConsulta,
      useFactory: (consultador: ConsultadorUbigeos) =>
        new ListarUbigeosConsulta(consultador),
      inject: [CONSULTADOR_UBIGEOS],
    },
    {
      provide: ListarRecursosIdentidadConsulta,
      useFactory: (consultador: RecursoIdentidadTypeormConsulta) =>
        new ListarRecursosIdentidadConsulta(consultador),
      inject: [RecursoIdentidadTypeormConsulta],
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
  exports: [
    CONSULTADOR_SEDES,
    CONSULTADOR_UBIGEOS,
    REPOSITORIO_INSTITUCIONES,
    REPOSITORIO_SEDES,
    REPOSITORIO_DIRECCIONES,
  ],
})
export class EstructuraInstitucionalModule {}
