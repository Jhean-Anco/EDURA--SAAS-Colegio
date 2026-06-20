import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AnioAcademicoTypeormEntidad,
  PeriodoAcademicoTypeormEntidad,
} from './infraestructura/persistencia/typeorm/entidades/periodos-academicos.typeorm-entidades';
import {
  AniosAcademicosTypeormRepositorio,
  PeriodosAcademicosTypeormRepositorio,
} from './infraestructura/persistencia/typeorm/repositorios/periodos-academicos.typeorm-repositorios';
import {
  REPOSITORIO_ANIOS_ACADEMICOS,
  REPOSITORIO_PERIODOS_ACADEMICOS,
} from './dominio/puertos/indice';
import {
  RepositorioAniosAcademicos,
  RepositorioPeriodosAcademicos,
} from './dominio/puertos/repositorios';
import { CrearAnioAcademicoCasoUso } from './aplicacion/anios/crear-anio-academico.caso-uso';
import { CambiarEstadoAnioCasoUso } from './aplicacion/anios/cambiar-estado-anio.caso-uso';
import { ListarAniosConsulta } from './aplicacion/anios/listar-anios.consulta';
import { ObtenerAnioConsulta } from './aplicacion/anios/obtener-anio.consulta';
import { CrearPeriodoAcademicoCasoUso } from './aplicacion/periodos/crear-periodo-academico.caso-uso';
import { CambiarEstadoPeriodoCasoUso } from './aplicacion/periodos/cambiar-estado-periodo.caso-uso';
import { ListarPeriodosConsulta } from './aplicacion/periodos/listar-periodos.consulta';
import { PeriodosAcademicosControlador } from './presentacion/http/controladores/periodos-academicos.controlador';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnioAcademicoTypeormEntidad,
      PeriodoAcademicoTypeormEntidad,
    ]),
  ],
  controllers: [PeriodosAcademicosControlador],
  providers: [
    AniosAcademicosTypeormRepositorio,
    PeriodosAcademicosTypeormRepositorio,
    {
      provide: REPOSITORIO_ANIOS_ACADEMICOS,
      useExisting: AniosAcademicosTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_PERIODOS_ACADEMICOS,
      useExisting: PeriodosAcademicosTypeormRepositorio,
    },
    {
      provide: CrearAnioAcademicoCasoUso,
      useFactory: (r: RepositorioAniosAcademicos) =>
        new CrearAnioAcademicoCasoUso(r),
      inject: [REPOSITORIO_ANIOS_ACADEMICOS],
    },
    {
      provide: CambiarEstadoAnioCasoUso,
      useFactory: (r: RepositorioAniosAcademicos) =>
        new CambiarEstadoAnioCasoUso(r),
      inject: [REPOSITORIO_ANIOS_ACADEMICOS],
    },
    {
      provide: ListarAniosConsulta,
      useFactory: (r: RepositorioAniosAcademicos) => new ListarAniosConsulta(r),
      inject: [REPOSITORIO_ANIOS_ACADEMICOS],
    },
    {
      provide: ObtenerAnioConsulta,
      useFactory: (r: RepositorioAniosAcademicos) => new ObtenerAnioConsulta(r),
      inject: [REPOSITORIO_ANIOS_ACADEMICOS],
    },
    {
      provide: CrearPeriodoAcademicoCasoUso,
      useFactory: (
        ra: RepositorioAniosAcademicos,
        rp: RepositorioPeriodosAcademicos,
      ) => new CrearPeriodoAcademicoCasoUso(ra, rp),
      inject: [REPOSITORIO_ANIOS_ACADEMICOS, REPOSITORIO_PERIODOS_ACADEMICOS],
    },
    {
      provide: CambiarEstadoPeriodoCasoUso,
      useFactory: (r: RepositorioPeriodosAcademicos) =>
        new CambiarEstadoPeriodoCasoUso(r),
      inject: [REPOSITORIO_PERIODOS_ACADEMICOS],
    },
    {
      provide: ListarPeriodosConsulta,
      useFactory: (r: RepositorioPeriodosAcademicos) =>
        new ListarPeriodosConsulta(r),
      inject: [REPOSITORIO_PERIODOS_ACADEMICOS],
    },
  ],
})
export class PeriodosAcademicosModule {}
