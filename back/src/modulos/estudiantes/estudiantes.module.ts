import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApoderadoEstudianteTypeormEntidad,
  DocumentoEstudianteTypeormEntidad,
  EstudianteTypeormEntidad,
} from './infraestructura/persistencia/typeorm/entidades/estudiantes.typeorm-entidades';
import { EstudiantesControlador } from './presentacion/http/controladores/estudiantes.controlador';
import { EstudiantesTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/estudiantes.typeorm-consulta';
import { EstudiantesTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/estudiantes.typeorm-repositorio';
import {
  CONSULTA_ESTUDIANTES,
  REPOSITORIO_ESTUDIANTES,
  EstudiantesConsulta,
  RepositorioEstudiantes,
} from './dominio/puertos/estudiantes.puerto';
import { ListarEstudiantesConsulta } from './aplicacion/listar-estudiantes.consulta';
import { ObtenerEstudianteConsulta } from './aplicacion/obtener-estudiante.consulta';
import { CrearEstudianteCasoUso } from './aplicacion/crear-estudiante.caso-uso';
import { ActualizarEstudianteCasoUso } from './aplicacion/actualizar-estudiante.caso-uso';
import { CambiarEstadoEstudianteCasoUso } from './aplicacion/cambiar-estado-estudiante.caso-uso';
import { AgregarApoderadoEstudianteCasoUso } from './aplicacion/agregar-apoderado-estudiante.caso-uso';
import { ActualizarApoderadoEstudianteCasoUso } from './aplicacion/actualizar-apoderado-estudiante.caso-uso';
import { RegistrarDocumentoEstudianteCasoUso } from './aplicacion/registrar-documento-estudiante.caso-uso';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstudianteTypeormEntidad,
      ApoderadoEstudianteTypeormEntidad,
      DocumentoEstudianteTypeormEntidad,
    ]),
  ],
  controllers: [EstudiantesControlador],
  providers: [
    EstudiantesTypeormConsulta,
    EstudiantesTypeormRepositorio,
    { provide: CONSULTA_ESTUDIANTES, useExisting: EstudiantesTypeormConsulta },
    {
      provide: REPOSITORIO_ESTUDIANTES,
      useExisting: EstudiantesTypeormRepositorio,
    },
    {
      provide: ListarEstudiantesConsulta,
      useFactory: (c: EstudiantesConsulta) => new ListarEstudiantesConsulta(c),
      inject: [CONSULTA_ESTUDIANTES],
    },
    {
      provide: ObtenerEstudianteConsulta,
      useFactory: (c: EstudiantesConsulta) => new ObtenerEstudianteConsulta(c),
      inject: [CONSULTA_ESTUDIANTES],
    },
    {
      provide: CrearEstudianteCasoUso,
      useFactory: (r: RepositorioEstudiantes) => new CrearEstudianteCasoUso(r),
      inject: [REPOSITORIO_ESTUDIANTES],
    },
    {
      provide: ActualizarEstudianteCasoUso,
      useFactory: (r: RepositorioEstudiantes) =>
        new ActualizarEstudianteCasoUso(r),
      inject: [REPOSITORIO_ESTUDIANTES],
    },
    {
      provide: CambiarEstadoEstudianteCasoUso,
      useFactory: (r: RepositorioEstudiantes) =>
        new CambiarEstadoEstudianteCasoUso(r),
      inject: [REPOSITORIO_ESTUDIANTES],
    },
    {
      provide: AgregarApoderadoEstudianteCasoUso,
      useFactory: (r: RepositorioEstudiantes) =>
        new AgregarApoderadoEstudianteCasoUso(r),
      inject: [REPOSITORIO_ESTUDIANTES],
    },
    {
      provide: ActualizarApoderadoEstudianteCasoUso,
      useFactory: (r: RepositorioEstudiantes) =>
        new ActualizarApoderadoEstudianteCasoUso(r),
      inject: [REPOSITORIO_ESTUDIANTES],
    },
    {
      provide: RegistrarDocumentoEstudianteCasoUso,
      useFactory: (r: RepositorioEstudiantes) =>
        new RegistrarDocumentoEstudianteCasoUso(r),
      inject: [REPOSITORIO_ESTUDIANTES],
    },
  ],
})
export class EstudiantesModule {}
