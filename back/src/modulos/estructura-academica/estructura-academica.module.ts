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
import { CambiarEstadoNivelEducativoCasoUso } from './aplicacion/catalogos/cambiar-estado-nivel-educativo.caso-uso';
import { ListarNivelesEducativosCasoUso } from './aplicacion/catalogos/listar-niveles-educativos.caso-uso';
import { CrearGradoEducativoCasoUso } from './aplicacion/catalogos/crear-grado-educativo.caso-uso';
import { ActualizarGradoEducativoCasoUso } from './aplicacion/catalogos/actualizar-grado-educativo.caso-uso';
import { CambiarEstadoGradoEducativoCasoUso } from './aplicacion/catalogos/cambiar-estado-grado-educativo.caso-uso';
import { ListarGradosEducativosCasoUso } from './aplicacion/catalogos/listar-grados-educativos.caso-uso';

// ── Casos de uso Oferta ───────────────────────────────────────────────────────
import { CrearOfertaGradoSedeCasoUso } from './aplicacion/oferta/crear-oferta-grado-sede.caso-uso';
import { ActualizarOfertaGradoSedeCasoUso } from './aplicacion/oferta/actualizar-oferta-grado-sede.caso-uso';
import { CambiarEstadoOfertaGradoSedeCasoUso } from './aplicacion/oferta/cambiar-estado-oferta-grado-sede.caso-uso';
import { ListarOfertasCasoUso } from './aplicacion/oferta/listar-ofertas.caso-uso';
import { CrearSeccionAcademicaCasoUso } from './aplicacion/oferta/crear-seccion-academica.caso-uso';
import { ActualizarSeccionAcademicaCasoUso } from './aplicacion/oferta/actualizar-seccion-academica.caso-uso';
import { CambiarEstadoSeccionAcademicaCasoUso } from './aplicacion/oferta/cambiar-estado-seccion-academica.caso-uso';
import { AsignarEspacioSeccionCasoUso } from './aplicacion/oferta/asignar-espacio-seccion.caso-uso';
import { AsignarTutorSeccionCasoUso } from './aplicacion/oferta/asignar-tutor-seccion.caso-uso';
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
      useFactory: (r: any) => new CrearAnioAcademicoCasoUso(r),
      inject: [REPOSITORIO_CALENDARIO_ACADEMICO],
    },
    {
      provide: ActualizarAnioAcademicoCasoUso,
      useFactory: (r: any) => new ActualizarAnioAcademicoCasoUso(r),
      inject: [REPOSITORIO_CALENDARIO_ACADEMICO],
    },
    {
      provide: CambiarEstadoAnioAcademicoCasoUso,
      useFactory: (r: any, ro: any) =>
        new CambiarEstadoAnioAcademicoCasoUso(r, ro),
      inject: [REPOSITORIO_CALENDARIO_ACADEMICO, REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: ListarAniosAcademicosCasoUso,
      useFactory: (c: any) => new ListarAniosAcademicosCasoUso(c),
      inject: [CONSULTADOR_ESTRUCTURA_ACADEMICA],
    },
    {
      provide: CrearPeriodoAcademicoCasoUso,
      useFactory: (r: any) => new CrearPeriodoAcademicoCasoUso(r),
      inject: [REPOSITORIO_CALENDARIO_ACADEMICO],
    },
    {
      provide: ActualizarPeriodoAcademicoCasoUso,
      useFactory: (r: any) => new ActualizarPeriodoAcademicoCasoUso(r),
      inject: [REPOSITORIO_CALENDARIO_ACADEMICO],
    },
    {
      provide: CambiarEstadoPeriodoAcademicoCasoUso,
      useFactory: (r: any) => new CambiarEstadoPeriodoAcademicoCasoUso(r),
      inject: [REPOSITORIO_CALENDARIO_ACADEMICO],
    },
    {
      provide: ListarPeriodosAcademicosCasoUso,
      useFactory: (c: any) => new ListarPeriodosAcademicosCasoUso(c),
      inject: [CONSULTADOR_ESTRUCTURA_ACADEMICA],
    },

    // ── Casos de uso Catálogos ──────────────────────────────────────────────
    {
      provide: CrearNivelEducativoCasoUso,
      useFactory: (r: any) => new CrearNivelEducativoCasoUso(r),
      inject: [REPOSITORIO_CATALOGOS_ACADEMICOS],
    },
    {
      provide: ActualizarNivelEducativoCasoUso,
      useFactory: (r: any) => new ActualizarNivelEducativoCasoUso(r),
      inject: [REPOSITORIO_CATALOGOS_ACADEMICOS],
    },
    {
      provide: CambiarEstadoNivelEducativoCasoUso,
      useFactory: (r: any) => new CambiarEstadoNivelEducativoCasoUso(r),
      inject: [REPOSITORIO_CATALOGOS_ACADEMICOS],
    },
    {
      provide: ListarNivelesEducativosCasoUso,
      useFactory: (c: any) => new ListarNivelesEducativosCasoUso(c),
      inject: [CONSULTADOR_ESTRUCTURA_ACADEMICA],
    },
    {
      provide: CrearGradoEducativoCasoUso,
      useFactory: (r: any) => new CrearGradoEducativoCasoUso(r),
      inject: [REPOSITORIO_CATALOGOS_ACADEMICOS],
    },
    {
      provide: ActualizarGradoEducativoCasoUso,
      useFactory: (r: any) => new ActualizarGradoEducativoCasoUso(r),
      inject: [REPOSITORIO_CATALOGOS_ACADEMICOS],
    },
    {
      provide: CambiarEstadoGradoEducativoCasoUso,
      useFactory: (r: any) => new CambiarEstadoGradoEducativoCasoUso(r),
      inject: [REPOSITORIO_CATALOGOS_ACADEMICOS],
    },
    {
      provide: ListarGradosEducativosCasoUso,
      useFactory: (c: any) => new ListarGradosEducativosCasoUso(c),
      inject: [CONSULTADOR_ESTRUCTURA_ACADEMICA],
    },

    // ── Casos de uso Oferta ─────────────────────────────────────────────────
    {
      provide: CrearOfertaGradoSedeCasoUso,
      useFactory: (r: any) => new CrearOfertaGradoSedeCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: ActualizarOfertaGradoSedeCasoUso,
      useFactory: (r: any) => new ActualizarOfertaGradoSedeCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: CambiarEstadoOfertaGradoSedeCasoUso,
      useFactory: (r: any) => new CambiarEstadoOfertaGradoSedeCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: ListarOfertasCasoUso,
      useFactory: (c: any) => new ListarOfertasCasoUso(c),
      inject: [CONSULTADOR_ESTRUCTURA_ACADEMICA],
    },
    {
      provide: CrearSeccionAcademicaCasoUso,
      useFactory: (r: any) => new CrearSeccionAcademicaCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: ActualizarSeccionAcademicaCasoUso,
      useFactory: (r: any) => new ActualizarSeccionAcademicaCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: CambiarEstadoSeccionAcademicaCasoUso,
      useFactory: (r: any) => new CambiarEstadoSeccionAcademicaCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: AsignarEspacioSeccionCasoUso,
      useFactory: (r: any) => new AsignarEspacioSeccionCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: AsignarTutorSeccionCasoUso,
      useFactory: (r: any) => new AsignarTutorSeccionCasoUso(r),
      inject: [REPOSITORIO_OFERTA_ACADEMICA],
    },
    {
      provide: ListarSeccionesCasoUso,
      useFactory: (c: any) => new ListarSeccionesCasoUso(c),
      inject: [CONSULTADOR_ESTRUCTURA_ACADEMICA],
    },

    // ── Caso de uso Panel ───────────────────────────────────────────────────
    {
      provide: ObtenerPeriodoActivoCasoUso,
      useFactory: (c: any) => new ObtenerPeriodoActivoCasoUso(c),
      inject: [CONSULTADOR_ESTRUCTURA_ACADEMICA],
    },
  ],
  exports: [ObtenerPeriodoActivoCasoUso],
})
export class EstructuraAcademicaModule {}
