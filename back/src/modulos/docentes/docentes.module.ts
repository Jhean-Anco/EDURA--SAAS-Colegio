import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CONSULTADOR_DOCENTES,
  REPOSITORIO_DOCENTES,
  REPOSITORIO_ESPECIALIDADES_PROFESIONALES,
  RepositorioDocentes,
  RepositorioEspecialidadesProfesionales,
} from './dominio/puertos/docentes.puerto';
import { DocenteTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/docente.typeorm-entidad';
import { EspecialidadProfesionalTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/especialidad-profesional.typeorm-entidad';
import { AsignacionDocenteSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/asignacion-docente-sede.typeorm-entidad';
import { DocenteEspecialidadTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/docente-especialidad.typeorm-entidad';
import { RepositorioDocentesTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-docentes.typeorm';
import { RepositorioEspecialidadesTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-especialidades.typeorm';
import { ConsultadorDocentesTypeorm } from './infraestructura/persistencia/typeorm/consultas/consultador-docentes.typeorm';
import { CrearDocenteCasoUso } from './aplicacion/crear-docente.caso-uso';
import { ActualizarDocenteCasoUso } from './aplicacion/actualizar-docente.caso-uso';
import { CambiarEstadoDocenteCasoUso } from './aplicacion/cambiar-estado-docente.caso-uso';
import { AsignarDocenteSedeCasoUso } from './aplicacion/asignar-docente-sede.caso-uso';
import { ActualizarAsignacionDocenteSedeCasoUso } from './aplicacion/actualizar-asignacion-docente-sede.caso-uso';
import { EstablecerSedePrincipalDocenteCasoUso } from './aplicacion/establecer-sede-principal-docente.caso-uso';
import { AsignarEspecialidadDocenteCasoUso } from './aplicacion/asignar-especialidad-docente.caso-uso';
import { ActualizarEspecialidadDocenteCasoUso } from './aplicacion/actualizar-especialidad-docente.caso-uso';
import { CrearEspecialidadProfesionalCasoUso } from './aplicacion/crear-especialidad-profesional.caso-uso';
import { ActualizarEspecialidadProfesionalCasoUso } from './aplicacion/actualizar-especialidad-profesional.caso-uso';
import { ListarDocentesCasoUso } from './aplicacion/listar-docentes.caso-uso';
import { ObtenerDocenteCasoUso } from './aplicacion/obtener-docente.caso-uso';
import { ListarEspecialidadesCasoUso } from './aplicacion/listar-especialidades.caso-uso';
import { ObtenerMiPerfilDocenteCasoUso } from './aplicacion/obtener-mi-perfil-docente.caso-uso';
import { DocentesControlador } from './presentacion/http/controladores/docentes.controlador';
import { EspecialidadesControlador } from './presentacion/http/controladores/especialidades.controlador';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocenteTypeormEntidad,
      EspecialidadProfesionalTypeormEntidad,
      AsignacionDocenteSedeTypeormEntidad,
      DocenteEspecialidadTypeormEntidad,
    ]),
  ],
  providers: [
    RepositorioDocentesTypeorm,
    RepositorioEspecialidadesTypeorm,
    ConsultadorDocentesTypeorm,
    {
      provide: REPOSITORIO_DOCENTES,
      useExisting: RepositorioDocentesTypeorm,
    },
    {
      provide: REPOSITORIO_ESPECIALIDADES_PROFESIONALES,
      useExisting: RepositorioEspecialidadesTypeorm,
    },
    {
      provide: CONSULTADOR_DOCENTES,
      useExisting: ConsultadorDocentesTypeorm,
    },
    {
      provide: CrearDocenteCasoUso,
      useFactory: (repo: RepositorioDocentes) => new CrearDocenteCasoUso(repo),
      inject: [REPOSITORIO_DOCENTES],
    },
    {
      provide: ActualizarDocenteCasoUso,
      useFactory: (repo: RepositorioDocentes) =>
        new ActualizarDocenteCasoUso(repo),
      inject: [REPOSITORIO_DOCENTES],
    },
    {
      provide: CambiarEstadoDocenteCasoUso,
      useFactory: (repo: RepositorioDocentes) =>
        new CambiarEstadoDocenteCasoUso(repo),
      inject: [REPOSITORIO_DOCENTES],
    },
    {
      provide: AsignarDocenteSedeCasoUso,
      useFactory: (repo: RepositorioDocentes) =>
        new AsignarDocenteSedeCasoUso(repo),
      inject: [REPOSITORIO_DOCENTES],
    },
    {
      provide: ActualizarAsignacionDocenteSedeCasoUso,
      useFactory: (repo: RepositorioDocentes) =>
        new ActualizarAsignacionDocenteSedeCasoUso(repo),
      inject: [REPOSITORIO_DOCENTES],
    },
    {
      provide: EstablecerSedePrincipalDocenteCasoUso,
      useFactory: (repo: RepositorioDocentes) =>
        new EstablecerSedePrincipalDocenteCasoUso(repo),
      inject: [REPOSITORIO_DOCENTES],
    },
    {
      provide: AsignarEspecialidadDocenteCasoUso,
      useFactory: (
        repoDocentes: RepositorioDocentes,
        repoEsp: RepositorioEspecialidadesProfesionales,
      ) => new AsignarEspecialidadDocenteCasoUso(repoDocentes, repoEsp),
      inject: [REPOSITORIO_DOCENTES, REPOSITORIO_ESPECIALIDADES_PROFESIONALES],
    },
    {
      provide: ActualizarEspecialidadDocenteCasoUso,
      useFactory: (
        repoDocentes: RepositorioDocentes,
        repoEsp: RepositorioEspecialidadesProfesionales,
      ) => new ActualizarEspecialidadDocenteCasoUso(repoDocentes, repoEsp),
      inject: [REPOSITORIO_DOCENTES, REPOSITORIO_ESPECIALIDADES_PROFESIONALES],
    },
    {
      provide: CrearEspecialidadProfesionalCasoUso,
      useFactory: (repo: RepositorioEspecialidadesProfesionales) =>
        new CrearEspecialidadProfesionalCasoUso(repo),
      inject: [REPOSITORIO_ESPECIALIDADES_PROFESIONALES],
    },
    {
      provide: ActualizarEspecialidadProfesionalCasoUso,
      useFactory: (repo: RepositorioEspecialidadesProfesionales) =>
        new ActualizarEspecialidadProfesionalCasoUso(repo),
      inject: [REPOSITORIO_ESPECIALIDADES_PROFESIONALES],
    },
    {
      provide: ListarDocentesCasoUso,
      useFactory: (consultador: ConsultadorDocentesTypeorm) =>
        new ListarDocentesCasoUso(consultador),
      inject: [ConsultadorDocentesTypeorm],
    },
    {
      provide: ObtenerDocenteCasoUso,
      useFactory: (consultador: ConsultadorDocentesTypeorm) =>
        new ObtenerDocenteCasoUso(consultador),
      inject: [ConsultadorDocentesTypeorm],
    },
    {
      provide: ListarEspecialidadesCasoUso,
      useFactory: (consultador: ConsultadorDocentesTypeorm) =>
        new ListarEspecialidadesCasoUso(consultador),
      inject: [ConsultadorDocentesTypeorm],
    },
    {
      provide: ObtenerMiPerfilDocenteCasoUso,
      useFactory: (consultador: ConsultadorDocentesTypeorm) =>
        new ObtenerMiPerfilDocenteCasoUso(consultador),
      inject: [ConsultadorDocentesTypeorm],
    },
  ],
  controllers: [DocentesControlador, EspecialidadesControlador],
  exports: [REPOSITORIO_DOCENTES, CONSULTADOR_DOCENTES],
})
export class DocentesModule {}
