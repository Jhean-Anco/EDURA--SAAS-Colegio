import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import {
  IdentidadVisualInstitucionTypeormEntidad,
  VersionIdentidadVisualTypeormEntidad,
  ActivoIdentidadVisualTypeormEntidad,
  PuntoAccesoInstitucionTypeormEntidad,
} from './infraestructura/persistencia/typeorm/entidades/identidad-visual.typeorm-entidades';
import { InstitucionEducativaTypeormEntidad } from '../estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';

// Repositorios e infraestructura
import {
  TypeOrmRepositorioIdentidadVisual,
  TypeOrmRepositorioVersionesIdentidad,
  TypeOrmRepositorioActivosIdentidad,
  TypeOrmRepositorioPuntosAcceso,
} from './infraestructura/persistencia/typeorm/repositorios/identidad-visual.typeorm-repositorios';
import { AlmacenamientoActivosLocal } from './infraestructura/almacenamiento/almacenamiento-activos';
import { ResolvedorPuntoAccesoInstitucionService } from './infraestructura/resolucion/resolvedor-punto-acceso.service';

// Casos de uso y consultas
import { ResolverExperienciaAccesoConsulta } from './aplicacion/resolucion/resolver-experiencia-acceso.consulta';
import {
  ObtenerIdentidadVisualConsulta,
  ObtenerBorradorIdentidadConsulta,
  ActualizarBorradorIdentidadCasoUso,
  PublicarIdentidadVisualCasoUso,
  InactivarIdentidadVisualCasoUso,
} from './aplicacion/identidades/identidad.casos-uso';
import {
  CargarActivoIdentidadCasoUso,
  ArchivarActivoIdentidadCasoUso,
} from './aplicacion/activos/activo.casos-uso';
import {
  ListarPuntosAccesoConsulta,
  CrearPuntoAccesoCasoUso,
  ActualizarPuntoAccesoCasoUso,
  SuspenderPuntoAccesoCasoUso,
} from './aplicacion/puntos-acceso/punto-acceso.casos-uso';

// Controlador
import { IdentidadVisualControlador } from './presentacion/http/controladores/identidad-visual.controlador';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IdentidadVisualInstitucionTypeormEntidad,
      VersionIdentidadVisualTypeormEntidad,
      ActivoIdentidadVisualTypeormEntidad,
      PuntoAccesoInstitucionTypeormEntidad,
      InstitucionEducativaTypeormEntidad,
    ]),
  ],
  controllers: [IdentidadVisualControlador],
  providers: [
    // Consultas y casos de uso
    ResolverExperienciaAccesoConsulta,
    ObtenerIdentidadVisualConsulta,
    ObtenerBorradorIdentidadConsulta,
    ActualizarBorradorIdentidadCasoUso,
    PublicarIdentidadVisualCasoUso,
    InactivarIdentidadVisualCasoUso,
    CargarActivoIdentidadCasoUso,
    ArchivarActivoIdentidadCasoUso,
    ListarPuntosAccesoConsulta,
    CrearPuntoAccesoCasoUso,
    ActualizarPuntoAccesoCasoUso,
    SuspenderPuntoAccesoCasoUso,

    // Mapeo de puertos a adaptadores
    {
      provide: 'REPOSITORIO_IDENTIDAD_VISUAL',
      useClass: TypeOrmRepositorioIdentidadVisual,
    },
    {
      provide: 'REPOSITORIO_VERSIONES_IDENTIDAD',
      useClass: TypeOrmRepositorioVersionesIdentidad,
    },
    {
      provide: 'REPOSITORIO_ACTIVOS_IDENTIDAD',
      useClass: TypeOrmRepositorioActivosIdentidad,
    },
    {
      provide: 'REPOSITORIO_PUNTOS_ACCESO',
      useClass: TypeOrmRepositorioPuntosAcceso,
    },
    {
      provide: 'ALMACENAMIENTO_ACTIVOS_IDENTIDAD',
      useClass: AlmacenamientoActivosLocal,
    },
    {
      provide: 'RESOLVEDOR_PUNTO_ACCESO_INSTITUCION',
      useClass: ResolvedorPuntoAccesoInstitucionService,
    },
  ],
  exports: [
    'RESOLVEDOR_PUNTO_ACCESO_INSTITUCION',
    ResolverExperienciaAccesoConsulta,
  ],
})
export class IdentidadVisualModule {}
