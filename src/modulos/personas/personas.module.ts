import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentidadAccesoModule } from '../identidad-acceso/identidad-acceso.module';
import { PersonasControlador } from './presentacion/http/controladores/personas.controlador';
import {
  PersonaTypeormEntidad,
  TipoDocumentoIdentidadTypeormEntidad,
  DocumentoIdentidadPersonaTypeormEntidad,
  MedioContactoPersonaTypeormEntidad,
  DireccionPersonaTypeormEntidad,
} from './infraestructura/persistencia/typeorm/entidades/personas.typeorm-entidades';
import {
  PersonasTypeormRepositorio,
  DocumentosIdentidadTypeormRepositorio,
  MediosContactoTypeormRepositorio,
  DireccionesPersonaTypeormRepositorio,
  VinculosPersonaMembresiaTypeormRepositorio,
} from './infraestructura/persistencia/typeorm/repositorios/personas.typeorm-repositorios';
import { CrearPersonaCasoUso } from './aplicacion/personas/crear-persona.caso-uso';
import { ObtenerPersonaConsulta } from './aplicacion/personas/obtener-persona.consulta';
import { ListarPersonasConsulta } from './aplicacion/personas/listar-personas.consulta';
import { RegistrarDocumentoPersonaCasoUso } from './aplicacion/documentos-identidad/registrar-documento-persona.caso-uso';
import { RegistrarMedioContactoPersonaCasoUso } from './aplicacion/medios-contacto/registrar-medio-contacto-persona.caso-uso';
import { RegistrarDireccionPersonaCasoUso } from './aplicacion/direcciones/registrar-direccion-persona.caso-uso';
import { VincularPersonaMembresiaCasoUso } from './aplicacion/vinculaciones/vincular-persona-membresia.caso-uso';
import {
  REPOSITORIO_PERSONAS,
  REPOSITORIO_DOCUMENTOS_IDENTIDAD_PERSONA,
  REPOSITORIO_MEDIOS_CONTACTO_PERSONA,
  REPOSITORIO_DIRECCIONES_PERSONA,
  REPOSITORIO_VINCULOS_PERSONA_MEMBRESIA,
} from './dominio/puertos/indice';
import {
  RepositorioPersonas,
  RepositorioDocumentosIdentidadPersona,
  RepositorioMediosContactoPersona,
  RepositorioDireccionesPersona,
  RepositorioVinculosPersonaMembresia,
} from './dominio/puertos/repositorios';
import { GuardiaPermisos } from '../../compartido/presentacion/http/guardias/guardia-permisos';
import { AsignacionRolUsuarioTypeormEntidad } from '../identidad-acceso/infraestructura/persistencia/typeorm/entidades/seguridad.typeorm-entidades';
import {
  CONSULTADOR_PERMISOS_EFECTIVOS,
  ConsultadorPermisosEfectivosTypeorm,
} from '../../compartido/infraestructura/persistencia/consultador-permisos.typeorm';

@Module({
  imports: [
    IdentidadAccesoModule,
    TypeOrmModule.forFeature([
      PersonaTypeormEntidad,
      TipoDocumentoIdentidadTypeormEntidad,
      DocumentoIdentidadPersonaTypeormEntidad,
      MedioContactoPersonaTypeormEntidad,
      DireccionPersonaTypeormEntidad,
      AsignacionRolUsuarioTypeormEntidad,
    ]),
  ],
  controllers: [PersonasControlador],
  providers: [
    PersonasTypeormRepositorio,
    DocumentosIdentidadTypeormRepositorio,
    MediosContactoTypeormRepositorio,
    DireccionesPersonaTypeormRepositorio,
    VinculosPersonaMembresiaTypeormRepositorio,
    ConsultadorPermisosEfectivosTypeorm,
    {
      provide: CONSULTADOR_PERMISOS_EFECTIVOS,
      useExisting: ConsultadorPermisosEfectivosTypeorm,
    },
    GuardiaPermisos,
    { provide: REPOSITORIO_PERSONAS, useExisting: PersonasTypeormRepositorio },
    {
      provide: REPOSITORIO_DOCUMENTOS_IDENTIDAD_PERSONA,
      useExisting: DocumentosIdentidadTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_MEDIOS_CONTACTO_PERSONA,
      useExisting: MediosContactoTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_DIRECCIONES_PERSONA,
      useExisting: DireccionesPersonaTypeormRepositorio,
    },
    {
      provide: REPOSITORIO_VINCULOS_PERSONA_MEMBRESIA,
      useExisting: VinculosPersonaMembresiaTypeormRepositorio,
    },
    {
      provide: CrearPersonaCasoUso,
      useFactory: (r: RepositorioPersonas) => new CrearPersonaCasoUso(r),
      inject: [REPOSITORIO_PERSONAS],
    },
    {
      provide: ObtenerPersonaConsulta,
      useFactory: (r: RepositorioPersonas) => new ObtenerPersonaConsulta(r),
      inject: [REPOSITORIO_PERSONAS],
    },
    {
      provide: ListarPersonasConsulta,
      useFactory: (r: RepositorioPersonas) => new ListarPersonasConsulta(r),
      inject: [REPOSITORIO_PERSONAS],
    },
    {
      provide: RegistrarDocumentoPersonaCasoUso,
      useFactory: (
        p: RepositorioPersonas,
        d: RepositorioDocumentosIdentidadPersona,
      ) => new RegistrarDocumentoPersonaCasoUso(p, d),
      inject: [REPOSITORIO_PERSONAS, REPOSITORIO_DOCUMENTOS_IDENTIDAD_PERSONA],
    },
    {
      provide: RegistrarMedioContactoPersonaCasoUso,
      useFactory: (
        p: RepositorioPersonas,
        c: RepositorioMediosContactoPersona,
      ) => new RegistrarMedioContactoPersonaCasoUso(p, c),
      inject: [REPOSITORIO_PERSONAS, REPOSITORIO_MEDIOS_CONTACTO_PERSONA],
    },
    {
      provide: RegistrarDireccionPersonaCasoUso,
      useFactory: (p: RepositorioPersonas, d: RepositorioDireccionesPersona) =>
        new RegistrarDireccionPersonaCasoUso(p, d),
      inject: [REPOSITORIO_PERSONAS, REPOSITORIO_DIRECCIONES_PERSONA],
    },
    {
      provide: VincularPersonaMembresiaCasoUso,
      useFactory: (
        p: RepositorioPersonas,
        v: RepositorioVinculosPersonaMembresia,
      ) => new VincularPersonaMembresiaCasoUso(p, v),
      inject: [REPOSITORIO_PERSONAS, REPOSITORIO_VINCULOS_PERSONA_MEMBRESIA],
    },
  ],
  exports: [
    CrearPersonaCasoUso,
    ObtenerPersonaConsulta,
    ListarPersonasConsulta,
  ],
})
export class PersonasModule {}
