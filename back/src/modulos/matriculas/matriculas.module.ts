import { Module } from '@nestjs/common';
import { CompartidoModule } from '../../compartido/compartido.module';
import {
  MATRICULAS_REPOSITORIO,
  MatriculasPuerto,
} from './dominio/puertos/matriculas.puerto';
import { MatriculasTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/matriculas.typeorm-repositorio';
import { MatriculasControlador } from './presentacion/http/controladores/matriculas.controlador';

// Use Cases
import { CrearMatriculaBorradorCasoUso } from './aplicacion/matriculas/crear-matricula-borrador.caso-uso';
import { ActualizarMatriculaBorradorCasoUso } from './aplicacion/matriculas/actualizar-matricula-borrador.caso-uso';
import { ActivarMatriculaCasoUso } from './aplicacion/matriculas/activar-matricula.caso-uso';
import { AnularMatriculaCasoUso } from './aplicacion/matriculas/anular-matricula.caso-uso';
import { RetirarMatriculaCasoUso } from './aplicacion/matriculas/retirar-matricula.caso-uso';
import { CambiarSeccionCasoUso } from './aplicacion/matriculas/cambiar-seccion.caso-uso';

// Queries
import { ObtenerMatriculaConsulta } from './aplicacion/matriculas/obtener-matricula.consulta';
import { ListarMatriculasConsulta } from './aplicacion/matriculas/listar-matriculas.consulta';
import { ListarHistorialEstadosConsulta } from './aplicacion/matriculas/listar-historial-estados.consulta';
import { ListarCambiosSeccionConsulta } from './aplicacion/matriculas/listar-cambios-seccion.consulta';
import { ConsultarCapacidadSeccionConsulta } from './aplicacion/matriculas/consultar-capacidad-seccion.consulta';

@Module({
  imports: [CompartidoModule],
  controllers: [MatriculasControlador],
  providers: [
    {
      provide: MATRICULAS_REPOSITORIO,
      useClass: MatriculasTypeormRepositorio,
    },
    // Use Cases
    {
      provide: CrearMatriculaBorradorCasoUso,
      useFactory: (repo: MatriculasPuerto) =>
        new CrearMatriculaBorradorCasoUso(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: ActualizarMatriculaBorradorCasoUso,
      useFactory: (repo: MatriculasPuerto) =>
        new ActualizarMatriculaBorradorCasoUso(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: ActivarMatriculaCasoUso,
      useFactory: (repo: MatriculasPuerto) => new ActivarMatriculaCasoUso(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: AnularMatriculaCasoUso,
      useFactory: (repo: MatriculasPuerto) => new AnularMatriculaCasoUso(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: RetirarMatriculaCasoUso,
      useFactory: (repo: MatriculasPuerto) => new RetirarMatriculaCasoUso(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: CambiarSeccionCasoUso,
      useFactory: (repo: MatriculasPuerto) => new CambiarSeccionCasoUso(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    // Queries
    {
      provide: ObtenerMatriculaConsulta,
      useFactory: (repo: MatriculasPuerto) =>
        new ObtenerMatriculaConsulta(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: ListarMatriculasConsulta,
      useFactory: (repo: MatriculasPuerto) =>
        new ListarMatriculasConsulta(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: ListarHistorialEstadosConsulta,
      useFactory: (repo: MatriculasPuerto) =>
        new ListarHistorialEstadosConsulta(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: ListarCambiosSeccionConsulta,
      useFactory: (repo: MatriculasPuerto) =>
        new ListarCambiosSeccionConsulta(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
    {
      provide: ConsultarCapacidadSeccionConsulta,
      useFactory: (repo: MatriculasPuerto) =>
        new ConsultarCapacidadSeccionConsulta(repo),
      inject: [MATRICULAS_REPOSITORIO],
    },
  ],
  exports: [
    MATRICULAS_REPOSITORIO,
    CrearMatriculaBorradorCasoUso,
    ActualizarMatriculaBorradorCasoUso,
    ActivarMatriculaCasoUso,
    AnularMatriculaCasoUso,
    RetirarMatriculaCasoUso,
    CambiarSeccionCasoUso,
    ObtenerMatriculaConsulta,
    ListarMatriculasConsulta,
    ListarHistorialEstadosConsulta,
    ListarCambiosSeccionConsulta,
    ConsultarCapacidadSeccionConsulta,
  ],
})
export class MatriculasModule {}
