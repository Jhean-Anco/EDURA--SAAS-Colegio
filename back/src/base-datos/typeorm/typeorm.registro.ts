import { DireccionSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/direccion-sede.typeorm-entidad';
import { CanalContactoSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/canal-contacto-sede.typeorm-entidad';
import { HorarioAtencionSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/horario-atencion-sede.typeorm-entidad';
import { IdentidadSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/identidad-sede.typeorm-entidad';
import { PaginaSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/pagina-sede.typeorm-entidad';
import { RecursoIdentidadSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/recurso-identidad-sede.typeorm-entidad';
import { InstitucionEducativaTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';
import { SeccionPaginaSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/seccion-pagina-sede.typeorm-entidad';
import { SedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { UbigeoTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/ubigeo.typeorm-entidad';
import { ComponenteInfraestructuraTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/componente-infraestructura.typeorm-entidad';
import { EdificacionTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/edificacion.typeorm-entidad';
import { ElementoInfraestructuraTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/elemento-infraestructura.typeorm-entidad';
import { EspacioExteriorTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/espacio-exterior.typeorm-entidad';
import { EspacioFisicoTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/espacio-fisico.typeorm-entidad';
import { EstadoConservacionTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/estado-conservacion.typeorm-entidad';
import { EvaluacionConservacionElementoTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/evaluacion-conservacion-elemento.typeorm-entidad';
import { NivelTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/nivel.typeorm-entidad';
import { PredioTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/predio.typeorm-entidad';
import { ServicioBasicoSedeTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/servicio-basico-sede.typeorm-entidad';
import { TipoComponenteInfraestructuraTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-componente-infraestructura.typeorm-entidad';
import { TipoEdificacionTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-edificacion.typeorm-entidad';
import { TipoElementoInfraestructuraTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-elemento-infraestructura.typeorm-entidad';
import { TipoEspacioExteriorTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-espacio-exterior.typeorm-entidad';
import { TipoEspacioFisicoTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-espacio-fisico.typeorm-entidad';
import { TipoServicioBasicoTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-servicio-basico.typeorm-entidad';
import { TipoTenenciaPredioTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-tenencia-predio.typeorm-entidad';
import { UnidadMedidaTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/unidad-medida.typeorm-entidad';
import {
  DireccionPersonaTypeormEntidad,
  DocumentoIdentidadPersonaTypeormEntidad,
  MedioContactoPersonaTypeormEntidad,
  PersonaTypeormEntidad,
  TipoDocumentoIdentidadTypeormEntidad,
} from '../../modulos/personas/infraestructura/persistencia/typeorm/entidades/personas.typeorm-entidades';
import {
  AsignacionRolUsuarioTypeormEntidad,
  ConfiguracionInstitucionTypeormEntidad,
  CredencialUsuarioTypeormEntidad,
  EventoAuditoriaTypeormEntidad,
  InvitacionAccesoTypeormEntidad,
  MembresiaInstitucionTypeormEntidad,
  PermisoTypeormEntidad,
  RolPermisoTypeormEntidad,
  RolTypeormEntidad,
  SesionUsuarioTypeormEntidad,
  TokenSeguridadUsuarioTypeormEntidad,
  UsuarioTypeormEntidad,
} from '../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/seguridad.typeorm-entidades';
import {
  AlertaInstitucionalTypeormEntidad,
  ComunicadoInstitucionalTypeormEntidad,
} from '../../modulos/panel-institucional/infraestructura/persistencia/typeorm/entidades/panel-institucional.typeorm-entidades';

export const entidadesTypeOrm = [
  InstitucionEducativaTypeormEntidad,
  SedeTypeormEntidad,
  UbigeoTypeormEntidad,
  DireccionSedeTypeormEntidad,
  IdentidadSedeTypeormEntidad,
  RecursoIdentidadSedeTypeormEntidad,
  CanalContactoSedeTypeormEntidad,
  HorarioAtencionSedeTypeormEntidad,
  PaginaSedeTypeormEntidad,
  SeccionPaginaSedeTypeormEntidad,
  TipoServicioBasicoTypeormEntidad,
  ServicioBasicoSedeTypeormEntidad,
  TipoElementoInfraestructuraTypeormEntidad,
  EstadoConservacionTypeormEntidad,
  EvaluacionConservacionElementoTypeormEntidad,
  TipoTenenciaPredioTypeormEntidad,
  TipoEdificacionTypeormEntidad,
  TipoEspacioFisicoTypeormEntidad,
  TipoEspacioExteriorTypeormEntidad,
  TipoComponenteInfraestructuraTypeormEntidad,
  UnidadMedidaTypeormEntidad,
  ElementoInfraestructuraTypeormEntidad,
  PredioTypeormEntidad,
  EdificacionTypeormEntidad,
  NivelTypeormEntidad,
  EspacioFisicoTypeormEntidad,
  EspacioExteriorTypeormEntidad,
  ComponenteInfraestructuraTypeormEntidad,
  UsuarioTypeormEntidad,
  CredencialUsuarioTypeormEntidad,
  MembresiaInstitucionTypeormEntidad,
  RolTypeormEntidad,
  PermisoTypeormEntidad,
  RolPermisoTypeormEntidad,
  AsignacionRolUsuarioTypeormEntidad,
  InvitacionAccesoTypeormEntidad,
  SesionUsuarioTypeormEntidad,
  TokenSeguridadUsuarioTypeormEntidad,
  EventoAuditoriaTypeormEntidad,
  ConfiguracionInstitucionTypeormEntidad,
  PersonaTypeormEntidad,
  TipoDocumentoIdentidadTypeormEntidad,
  DocumentoIdentidadPersonaTypeormEntidad,
  MedioContactoPersonaTypeormEntidad,
  DireccionPersonaTypeormEntidad,
  AlertaInstitucionalTypeormEntidad,
  ComunicadoInstitucionalTypeormEntidad,
] as unknown as ConstructorEntidad[];
type ConstructorEntidad = new (...argumentos: never[]) => unknown;
