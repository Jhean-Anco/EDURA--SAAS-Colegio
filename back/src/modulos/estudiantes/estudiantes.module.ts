import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApoderadoEstudianteTypeormEntidad,
  DocumentoEstudianteTypeormEntidad,
  EstudianteTypeormEntidad,
} from './infraestructura/persistencia/typeorm/entidades/estudiantes.typeorm-entidades';
import { EstudiantesControlador } from './presentacion/http/controladores/estudiantes.controlador';
import { EstudiantesTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/estudiantes.typeorm-consulta';
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
    ListarEstudiantesConsulta,
    ObtenerEstudianteConsulta,
    CrearEstudianteCasoUso,
    ActualizarEstudianteCasoUso,
    CambiarEstadoEstudianteCasoUso,
    AgregarApoderadoEstudianteCasoUso,
    ActualizarApoderadoEstudianteCasoUso,
    RegistrarDocumentoEstudianteCasoUso,
  ],
})
export class EstudiantesModule {}
