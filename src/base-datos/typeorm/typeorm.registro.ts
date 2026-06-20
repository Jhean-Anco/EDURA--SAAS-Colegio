import { DireccionSedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/direccion-sede.typeorm-entidad';
import { InstitucionEducativaTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';
import { SedeTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { UbigeoTypeormEntidad } from '../../modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/ubigeo.typeorm-entidad';
import { ComponenteInfraestructuraTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/componente-infraestructura.typeorm-entidad';
import { EdificacionTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/edificacion.typeorm-entidad';
import { ElementoInfraestructuraTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/elemento-infraestructura.typeorm-entidad';
import { EspacioExteriorTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/espacio-exterior.typeorm-entidad';
import { EspacioFisicoTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/espacio-fisico.typeorm-entidad';
import { EstadoConservacionTypeormEntidad } from '../../modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/estado-conservacion.typeorm-entidad';
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

export const entidadesTypeOrm = [
  InstitucionEducativaTypeormEntidad,
  SedeTypeormEntidad,
  UbigeoTypeormEntidad,
  DireccionSedeTypeormEntidad,
  TipoServicioBasicoTypeormEntidad,
  ServicioBasicoSedeTypeormEntidad,
  TipoElementoInfraestructuraTypeormEntidad,
  EstadoConservacionTypeormEntidad,
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
] as unknown as ConstructorEntidad[];
type ConstructorEntidad = new (...argumentos: never[]) => unknown;
