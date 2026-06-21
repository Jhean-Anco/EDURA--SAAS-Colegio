import { Module } from '@nestjs/common';
import { CompartidoModule } from '../../compartido/compartido.module';
import {
  CONSULTADOR_ESTRUCTURA_ACADEMICA,
  REPOSITORIO_CALENDARIO_ACADEMICO,
  REPOSITORIO_CATALOGOS_ACADEMICOS,
  REPOSITORIO_OFERTA_ACADEMICA,
} from './dominio/puertos/estructura-academica.puerto';
import { RepositorioCalendarioAcademicoTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-calendario-academico.typeorm';
import { RepositorioCatalogosAcademicosTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-catalogos-academicos.typeorm';
import { RepositorioOfertaAcademicaTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-oferta-academica.typeorm';
import { ConsultadorEstructuraAcademicaTypeorm } from './infraestructura/persistencia/typeorm/consultas/consultador-estructura-academica.typeorm';
import { CalendarioControlador } from './presentacion/http/controladores/calendario.controlador';
import { CatalogosControlador } from './presentacion/http/controladores/catalogos.controlador';
import { OfertaControlador } from './presentacion/http/controladores/oferta.controlador';
import { AuditoriaEstructuraAcademicaInterceptor } from './presentacion/http/interceptores/auditoria-estructura-academica.interceptor';

// ── Casos de uso Calendario ───────────────────────────────────────────────────
import { CrearAnioAcademicoCasoUso } from './aplicacion/calendario/crear-anio-academico.caso-uso';
import { ActualizarAnioAcademicoCasoUso } from './aplicacion/calendario/actualizar-anio-academico.caso-uso';
import { CambiarEstadoAnioAcademicoCasoUso } from './aplicacion/calendario/cambiar-estado-anio-academico.caso-uso';
import { ListarAniosAcademicosCasoUso } from './aplicacion/calendario/listar-anios-academicos.caso-uso';
import { CrearPeriodoAcademicoCasoUso } from './aplicacion/calendario/crear-periodo-academico.caso-uso';
import { ActualizarPeriodoAcademicoCasoUso } from './aplicacion/calendario/actualizar-periodo-academico.caso-uso';
import { CambiarEstadoPeriodoAcademicoCasoUso } from './aplicacion/calendario/cambiar-estado-periodo-academico.caso-uso';
import { ListarPeriodosAcademicosCasoUso } from './aplicacion/calendario/listar-periodos-academicos.caso-uso';

// ── Casos de uso Catálogos ────────────────────────────────────────────────────
import { CrearNivelEducativoCasoUso } from './aplicacion/catalogos/crear-nivel-educativo.caso-uso';
import { ActualizarNivelEducativoCasoUso } from './aplicacion/catalogos/actualizar-nivel-educativo.caso-uso';
import { ListarNivelesEducativosCasoUso } from './aplicacion/catalogos/listar-niveles-educativos.caso-uso';
import { CrearGradoEducativoCasoUso } from './aplicacion/catalogos/crear-grado-educativo.caso-uso';
import { ActualizarGradoEducativoCasoUso } from './aplicacion/catalogos/actualizar-grado-educativo.caso-uso';
import { ListarGradosEducativosCasoUso } from './aplicacion/catalogos/listar-grados-educativos.caso-uso';

// ── Casos de uso Oferta ───────────────────────────────────────────────────────
import { CrearOfertaGradoSedeCasoUso } from './aplicacion/oferta/crear-oferta-grado-sede.caso-uso';
import { ActualizarOfertaGradoSedeCasoUso } from './aplicacion/oferta/actualizar-oferta-grado-sede.caso-uso';
import { ListarOfertasCasoUso } from './aplicacion/oferta/listar-ofertas.caso-uso';
import { CrearSeccionAcademicaCasoUso } from './aplicacion/oferta/crear-seccion-academica.caso-uso';
import { ActualizarSeccionAcademicaCasoUso } from './aplicacion/oferta/actualizar-seccion-academica.caso-uso';
import { ListarSeccionesCasoUso } from './aplicacion/oferta/listar-secciones.caso-uso';

// ── Caso de uso Panel ─────────────────────────────────────────────────────────
import { ObtenerPeriodoActivoCasoUso } from './aplicacion/panel/obtener-periodo-activo.caso-uso';

@Module({
  imports: [CompartidoModule],
  controllers: [CalendarioControlador, CatalogosControlador, OfertaControlador],
  providers: [
    // ── Adaptadores de infraestructura ──────────────────────────────────────
    RepositorioCalendarioAcademicoTypeorm,
    RepositorioCatalogosAcademicosTypeorm,
    RepositorioOfertaAcademicaTypeorm,
    ConsultadorEstructuraAcademicaTypeorm,
    AuditoriaEstructuraAcademicaInterceptor,

    // ── Tokens de dominio → implementaciones ────────────────────────────────
    {
      provide: REPOSITORIO_CALENDARIO_ACADEMICO,
      useExisting: RepositorioCalendarioAcademicoTypeorm,
    },
    {
      provide: REPOSITORIO_CATALOGOS_ACADEMICOS,
      useExisting: RepositorioCatalogosAcademicosTypeorm,
    },
    {
      provide: REPOSITORIO_OFERTA_ACADEMICA,
      useExisting: RepositorioOfertaAcademicaTypeorm,
    },
    {
      provide: CONSULTADOR_ESTRUCTURA_ACADEMICA,
      useExisting: ConsultadorEstructuraAcademicaTypeorm,
    },

    // ── Casos de uso Calendario ─────────────────────────────────────────────
    {
      provide: CrearAnioAcademicoCasoUso,
      useFactory: (r: RepositorioCalendarioAcademicoTypeorm) =>
        new CrearAnioAcademicoCasoUso(r),
      inject: [RepositorioCalendarioAcademicoTypeorm],
    },
    {
      provide: ActualizarAnioAcademicoCasoUso,
      useFactory: (r: RepositorioCalendarioAcademicoTypeorm) =>
        new ActualizarAnioAcademicoCasoUso(r),
      inject: [RepositorioCalendarioAcademicoTypeorm],
    },
    {
      provide: CambiarEstadoAnioAcademicoCasoUso,
      useFactory: (r: RepositorioCalendarioAcademicoTypeorm) =>
        new CambiarEstadoAnioAcademicoCasoUso(r),
      inject: [RepositorioCalendarioAcademicoTypeorm],
    },
    {
      provide: ListarAniosAcademicosCasoUso,
      useFactory: (c: ConsultadorEstructuraAcademicaTypeorm) =>
        new ListarAniosAcademicosCasoUso(c),
      inject: [ConsultadorEstructuraAcademicaTypeorm],
    },
    {
      provide: CrearPeriodoAcademicoCasoUso,
      useFactory: (r: RepositorioCalendarioAcademicoTypeorm) =>
        new CrearPeriodoAcademicoCasoUso(r),
      inject: [RepositorioCalendarioAcademicoTypeorm],
    },
    {
      provide: ActualizarPeriodoAcademicoCasoUso,
      useFactory: (r: RepositorioCalendarioAcademicoTypeorm) =>
        new ActualizarPeriodoAcademicoCasoUso(r),
      inject: [RepositorioCalendarioAcademicoTypeorm],
    },
    {
      provide: CambiarEstadoPeriodoAcademicoCasoUso,
      useFactory: (r: RepositorioCalendarioAcademicoTypeorm) =>
        new CambiarEstadoPeriodoAcademicoCasoUso(r),
      inject: [RepositorioCalendarioAcademicoTypeorm],
    },
    {
      provide: ListarPeriodosAcademicosCasoUso,
      useFactory: (c: ConsultadorEstructuraAcademicaTypeorm) =>
        new ListarPeriodosAcademicosCasoUso(c),
      inject: [ConsultadorEstructuraAcademicaTypeorm],
    },

    // ── Casos de uso Catálogos ──────────────────────────────────────────────
    {
      provide: CrearNivelEducativoCasoUso,
      useFactory: (r: RepositorioCatalogosAcademicosTypeorm) =>
        new CrearNivelEducativoCasoUso(r),
      inject: [RepositorioCatalogosAcademicosTypeorm],
    },
    {
      provide: ActualizarNivelEducativoCasoUso,
      useFactory: (r: RepositorioCatalogosAcademicosTypeorm) =>
        new ActualizarNivelEducativoCasoUso(r),
      inject: [RepositorioCatalogosAcademicosTypeorm],
    },
    {
      provide: ListarNivelesEducativosCasoUso,
      useFactory: (c: ConsultadorEstructuraAcademicaTypeorm) =>
        new ListarNivelesEducativosCasoUso(c),
      inject: [ConsultadorEstructuraAcademicaTypeorm],
    },
    {
      provide: CrearGradoEducativoCasoUso,
      useFactory: (r: RepositorioCatalogosAcademicosTypeorm) =>
        new CrearGradoEducativoCasoUso(r),
      inject: [RepositorioCatalogosAcademicosTypeorm],
    },
    {
      provide: ActualizarGradoEducativoCasoUso,
      useFactory: (r: RepositorioCatalogosAcademicosTypeorm) =>
        new ActualizarGradoEducativoCasoUso(r),
      inject: [RepositorioCatalogosAcademicosTypeorm],
    },
    {
      provide: ListarGradosEducativosCasoUso,
      useFactory: (c: ConsultadorEstructuraAcademicaTypeorm) =>
        new ListarGradosEducativosCasoUso(c),
      inject: [ConsultadorEstructuraAcademicaTypeorm],
    },

    // ── Casos de uso Oferta ─────────────────────────────────────────────────
    {
      provide: CrearOfertaGradoSedeCasoUso,
      useFactory: (r: RepositorioOfertaAcademicaTypeorm) =>
        new CrearOfertaGradoSedeCasoUso(r),
      inject: [RepositorioOfertaAcademicaTypeorm],
    },
    {
      provide: ActualizarOfertaGradoSedeCasoUso,
      useFactory: (r: RepositorioOfertaAcademicaTypeorm) =>
        new ActualizarOfertaGradoSedeCasoUso(r),
      inject: [RepositorioOfertaAcademicaTypeorm],
    },
    {
      provide: ListarOfertasCasoUso,
      useFactory: (c: ConsultadorEstructuraAcademicaTypeorm) =>
        new ListarOfertasCasoUso(c),
      inject: [ConsultadorEstructuraAcademicaTypeorm],
    },
    {
      provide: CrearSeccionAcademicaCasoUso,
      useFactory: (r: RepositorioOfertaAcademicaTypeorm) =>
        new CrearSeccionAcademicaCasoUso(r),
      inject: [RepositorioOfertaAcademicaTypeorm],
    },
    {
      provide: ActualizarSeccionAcademicaCasoUso,
      useFactory: (r: RepositorioOfertaAcademicaTypeorm) =>
        new ActualizarSeccionAcademicaCasoUso(r),
      inject: [RepositorioOfertaAcademicaTypeorm],
    },
    {
      provide: ListarSeccionesCasoUso,
      useFactory: (c: ConsultadorEstructuraAcademicaTypeorm) =>
        new ListarSeccionesCasoUso(c),
      inject: [ConsultadorEstructuraAcademicaTypeorm],
    },

    // ── Caso de uso Panel ───────────────────────────────────────────────────
    {
      provide: ObtenerPeriodoActivoCasoUso,
      useFactory: (c: ConsultadorEstructuraAcademicaTypeorm) =>
        new ObtenerPeriodoActivoCasoUso(c),
      inject: [ConsultadorEstructuraAcademicaTypeorm],
    },
  ],
  exports: [ObtenerPeriodoActivoCasoUso],
})
export class EstructuraAcademicaModule {}
