import { Module } from '@nestjs/common';
import { CompartidoModule } from '../../compartido/compartido.module';
import {
  REPOSITORIO_AREAS_CURRICULARES,
  REPOSITORIO_ASIGNATURAS,
  REPOSITORIO_PLANES_ESTUDIO,
  CONSULTADOR_CURRICULO,
} from './dominio/puertos/curriculo.puerto';
import type {
  RepositorioAreasCurriculares,
  RepositorioAsignaturas,
  RepositorioPlanesEstudio,
  ConsultadorCurriculo,
} from './dominio/puertos/curriculo.puerto';
import { RepositorioAreasCurricularesTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-areas-curriculares.typeorm';
import { RepositorioAsignaturasTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-asignaturas.typeorm';
import { RepositorioPlanesEstudioTypeorm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-planes-estudio.typeorm';
import { ConsultadorCurriculoTypeorm } from './infraestructura/persistencia/typeorm/consultas/consultador-curriculo.typeorm';
import { AreasControlador } from './presentacion/http/controladores/areas.controlador';
import { AsignaturasControlador } from './presentacion/http/controladores/asignaturas.controlador';
import { PlanesEstudioControlador } from './presentacion/http/controladores/planes-estudio.controlador';
import { AuditoriaCurriculoInterceptor } from './presentacion/http/interceptores/auditoria-curriculo.interceptor';

// Areas Use Cases
import { CrearAreaCurricularCasoUso } from './aplicacion/areas/crear-area-curricular.caso-uso';
import { ActualizarAreaCurricularCasoUso } from './aplicacion/areas/actualizar-area-curricular.caso-uso';
import { CambiarEstadoAreaCurricularCasoUso } from './aplicacion/areas/cambiar-estado-area-curricular.caso-uso';
import { ListarAreasCurricularesConsulta } from './aplicacion/areas/listar-areas-curriculares.consulta';
import { ObtenerAreaCurricularConsulta } from './aplicacion/areas/obtener-area-curricular.consulta';

// Asignaturas Use Cases
import { CrearAsignaturaCasoUso } from './aplicacion/asignaturas/crear-asignatura.caso-uso';
import { ActualizarAsignaturaCasoUso } from './aplicacion/asignaturas/actualizar-asignatura.caso-uso';
import { CambiarEstadoAsignaturaCasoUso } from './aplicacion/asignaturas/cambiar-estado-asignatura.caso-uso';
import { ListarAsignaturasConsulta } from './aplicacion/asignaturas/listar-asignaturas.consulta';
import { ObtenerAsignaturaConsulta } from './aplicacion/asignaturas/obtener-asignatura.consulta';

// Planes de estudio Use Cases
import { CrearPlanEstudioCasoUso } from './aplicacion/planes-estudio/crear-plan-estudio.caso-uso';
import { ActualizarPlanEstudioCasoUso } from './aplicacion/planes-estudio/actualizar-plan-estudio.caso-uso';
import { CambiarEstadoPlanEstudioCasoUso } from './aplicacion/planes-estudio/cambiar-estado-plan-estudio.caso-uso';
import { ListarPlanesEstudioConsulta } from './aplicacion/planes-estudio/listar-planes-estudio.consulta';
import { ObtenerPlanEstudioConsulta } from './aplicacion/planes-estudio/obtener-plan-estudio.consulta';
import { ResolverPlanVigenteConsulta } from './aplicacion/planes-estudio/resolver-plan-vigente.consulta';
import { DuplicarPlanEstudioCasoUso } from './aplicacion/planes-estudio/duplicar-plan-estudio.caso-uso';

// Detalles Use Cases
import { AgregarDetallePlanEstudioCasoUso } from './aplicacion/planes-estudio/agregar-detalle-plan-estudio.caso-uso';
import { ActualizarDetallePlanEstudioCasoUso } from './aplicacion/planes-estudio/actualizar-detalle-plan-estudio.caso-uso';
import { CambiarEstadoDetallePlanEstudioCasoUso } from './aplicacion/planes-estudio/cambiar-estado-detalle-plan-estudio.caso-uso';
import { ListarDetallesPlanEstudioConsulta } from './aplicacion/planes-estudio/listar-detalles-plan-estudio.consulta';

@Module({
  imports: [CompartidoModule],
  controllers: [
    AreasControlador,
    AsignaturasControlador,
    PlanesEstudioControlador,
  ],
  providers: [
    RepositorioAreasCurricularesTypeorm,
    RepositorioAsignaturasTypeorm,
    RepositorioPlanesEstudioTypeorm,
    ConsultadorCurriculoTypeorm,
    AuditoriaCurriculoInterceptor,

    {
      provide: REPOSITORIO_AREAS_CURRICULARES,
      useExisting: RepositorioAreasCurricularesTypeorm,
    },
    {
      provide: REPOSITORIO_ASIGNATURAS,
      useExisting: RepositorioAsignaturasTypeorm,
    },
    {
      provide: REPOSITORIO_PLANES_ESTUDIO,
      useExisting: RepositorioPlanesEstudioTypeorm,
    },
    {
      provide: CONSULTADOR_CURRICULO,
      useExisting: ConsultadorCurriculoTypeorm,
    },

    // Areas cases
    {
      provide: CrearAreaCurricularCasoUso,
      useFactory: (r: RepositorioAreasCurriculares) => new CrearAreaCurricularCasoUso(r),
      inject: [REPOSITORIO_AREAS_CURRICULARES],
    },
    {
      provide: ActualizarAreaCurricularCasoUso,
      useFactory: (r: RepositorioAreasCurriculares) => new ActualizarAreaCurricularCasoUso(r),
      inject: [REPOSITORIO_AREAS_CURRICULARES],
    },
    {
      provide: CambiarEstadoAreaCurricularCasoUso,
      useFactory: (r: RepositorioAreasCurriculares) => new CambiarEstadoAreaCurricularCasoUso(r),
      inject: [REPOSITORIO_AREAS_CURRICULARES],
    },
    {
      provide: ListarAreasCurricularesConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ListarAreasCurricularesConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },
    {
      provide: ObtenerAreaCurricularConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ObtenerAreaCurricularConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },

    // Asignaturas cases
    {
      provide: CrearAsignaturaCasoUso,
      useFactory: (r: RepositorioAsignaturas) => new CrearAsignaturaCasoUso(r),
      inject: [REPOSITORIO_ASIGNATURAS],
    },
    {
      provide: ActualizarAsignaturaCasoUso,
      useFactory: (r: RepositorioAsignaturas) => new ActualizarAsignaturaCasoUso(r),
      inject: [REPOSITORIO_ASIGNATURAS],
    },
    {
      provide: CambiarEstadoAsignaturaCasoUso,
      useFactory: (r: RepositorioAsignaturas) => new CambiarEstadoAsignaturaCasoUso(r),
      inject: [REPOSITORIO_ASIGNATURAS],
    },
    {
      provide: ListarAsignaturasConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ListarAsignaturasConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },
    {
      provide: ObtenerAsignaturaConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ObtenerAsignaturaConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },

    // Planes cases
    {
      provide: CrearPlanEstudioCasoUso,
      useFactory: (r: RepositorioPlanesEstudio) => new CrearPlanEstudioCasoUso(r),
      inject: [REPOSITORIO_PLANES_ESTUDIO],
    },
    {
      provide: ActualizarPlanEstudioCasoUso,
      useFactory: (r: RepositorioPlanesEstudio) => new ActualizarPlanEstudioCasoUso(r),
      inject: [REPOSITORIO_PLANES_ESTUDIO],
    },
    {
      provide: CambiarEstadoPlanEstudioCasoUso,
      useFactory: (r: RepositorioPlanesEstudio) => new CambiarEstadoPlanEstudioCasoUso(r),
      inject: [REPOSITORIO_PLANES_ESTUDIO],
    },
    {
      provide: ListarPlanesEstudioConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ListarPlanesEstudioConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },
    {
      provide: ObtenerPlanEstudioConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ObtenerPlanEstudioConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },
    {
      provide: ResolverPlanVigenteConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ResolverPlanVigenteConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },
    {
      provide: DuplicarPlanEstudioCasoUso,
      useFactory: (r: RepositorioPlanesEstudio) => new DuplicarPlanEstudioCasoUso(r),
      inject: [REPOSITORIO_PLANES_ESTUDIO],
    },

    // Detalles cases
    {
      provide: AgregarDetallePlanEstudioCasoUso,
      useFactory: (r: RepositorioPlanesEstudio) => new AgregarDetallePlanEstudioCasoUso(r),
      inject: [REPOSITORIO_PLANES_ESTUDIO],
    },
    {
      provide: ActualizarDetallePlanEstudioCasoUso,
      useFactory: (r: RepositorioPlanesEstudio) => new ActualizarDetallePlanEstudioCasoUso(r),
      inject: [REPOSITORIO_PLANES_ESTUDIO],
    },
    {
      provide: CambiarEstadoDetallePlanEstudioCasoUso,
      useFactory: (r: RepositorioPlanesEstudio) => new CambiarEstadoDetallePlanEstudioCasoUso(r),
      inject: [REPOSITORIO_PLANES_ESTUDIO],
    },
    {
      provide: ListarDetallesPlanEstudioConsulta,
      useFactory: (c: ConsultadorCurriculo) => new ListarDetallesPlanEstudioConsulta(c),
      inject: [CONSULTADOR_CURRICULO],
    },
  ],
  exports: [
    CrearAreaCurricularCasoUso,
    CrearAsignaturaCasoUso,
    CrearPlanEstudioCasoUso,
    ResolverPlanVigenteConsulta,
  ],
})
export class CurriculoModule { }
