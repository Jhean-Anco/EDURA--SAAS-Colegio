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
import { GuardiaJwt } from '../identidad-acceso/presentacion/http/guardias/guardia-jwt';
import { GuardiaPermisos } from '../../compartido/presentacion/http/guardias/guardia-permisos';

@Module({
  imports: [
    IdentidadAccesoModule,
    TypeOrmModule.forFeature([
      PersonaTypeormEntidad,
      TipoDocumentoIdentidadTypeormEntidad,
      DocumentoIdentidadPersonaTypeormEntidad,
      MedioContactoPersonaTypeormEntidad,
      DireccionPersonaTypeormEntidad,
    ]),
  ],
  controllers: [PersonasControlador],
  providers: [
    PersonasTypeormRepositorio,
    DocumentosIdentidadTypeormRepositorio,
    MediosContactoTypeormRepositorio,
    DireccionesPersonaTypeormRepositorio,
    VinculosPersonaMembresiaTypeormRepositorio,
    GuardiaJwt,
    GuardiaPermisos,
    {
      provide: REPOSITORIO_PERSONAS,
      useExisting: PersonasTypeormRepositorio,
    },
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
    CrearPersonaCasoUso,
    ObtenerPersonaConsulta,
    ListarPersonasConsulta,
    RegistrarDocumentoPersonaCasoUso,
    RegistrarMedioContactoPersonaCasoUso,
    RegistrarDireccionPersonaCasoUso,
    VincularPersonaMembresiaCasoUso,
  ],
  exports: [
    CrearPersonaCasoUso,
    ObtenerPersonaConsulta,
    ListarPersonasConsulta,
  ],
})
export class PersonasModule {}
