import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponenteInfraestructuraTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/componente-infraestructura.typeorm-entidad';
import { EdificacionTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/edificacion.typeorm-entidad';
import { ElementoInfraestructuraTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/elemento-infraestructura.typeorm-entidad';
import { EspacioExteriorTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/espacio-exterior.typeorm-entidad';
import { EspacioFisicoTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/espacio-fisico.typeorm-entidad';
import { EstadoConservacionTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/estado-conservacion.typeorm-entidad';
import { NivelTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/nivel.typeorm-entidad';
import { PredioTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/predio.typeorm-entidad';
import { ServicioBasicoSedeTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/servicio-basico-sede.typeorm-entidad';
import { TipoComponenteInfraestructuraTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/tipo-componente-infraestructura.typeorm-entidad';
import { TipoEdificacionTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/tipo-edificacion.typeorm-entidad';
import { TipoElementoInfraestructuraTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/tipo-elemento-infraestructura.typeorm-entidad';
import { TipoEspacioExteriorTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/tipo-espacio-exterior.typeorm-entidad';
import { TipoEspacioFisicoTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/tipo-espacio-fisico.typeorm-entidad';
import { TipoServicioBasicoTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/tipo-servicio-basico.typeorm-entidad';
import { TipoTenenciaPredioTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/tipo-tenencia-predio.typeorm-entidad';
import { UnidadMedidaTypeormEntidad } from './infraestructura/persistencia/typeorm/entidades/unidad-medida.typeorm-entidad';
import { SedeTypeormEntidad } from '../estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { ServiciosBasicosControlador } from './presentacion/http/controladores/servicios-basicos.controlador';
import { InfraestructuraControlador } from './presentacion/http/controladores/infraestructura.controlador';
import { ServicioBasicoTypeormRepositorio } from './infraestructura/persistencia/typeorm/repositorios/servicio-basico.typeorm-repositorio';
import { RepositorioElementosInfraestructuraTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/repositorio-elementos-infraestructura.typeorm-consulta';
import { RegistrarServicioBasicoSedeCasoUso } from './aplicacion/servicios-basicos/registrar-servicio-basico-sede.caso-uso';
import { ListarServiciosBasicosSedeConsulta } from './aplicacion/servicios-basicos/listar-servicios-basicos-sede.consulta';
import { CambiarEstadoServicioBasicoCasoUso } from './aplicacion/servicios-basicos/cambiar-estado-servicio-basico.caso-uso';
import { ListarElementosInfraestructuraConsulta } from './aplicacion/consultas/listar-elementos-infraestructura.consulta';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TipoServicioBasicoTypeormEntidad,
      ServicioBasicoSedeTypeormEntidad,
      SedeTypeormEntidad,
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
    ]),
  ],
  providers: [
    ServicioBasicoTypeormRepositorio,
    RepositorioElementosInfraestructuraTypeormConsulta,
    RegistrarServicioBasicoSedeCasoUso,
    ListarServiciosBasicosSedeConsulta,
    CambiarEstadoServicioBasicoCasoUso,
    ListarElementosInfraestructuraConsulta,
  ],
  controllers: [ServiciosBasicosControlador, InfraestructuraControlador],
  exports: [TypeOrmModule],
})
export class InfraestructuraFisicaModule {}
