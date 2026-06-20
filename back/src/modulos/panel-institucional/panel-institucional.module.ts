import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObtenerResumenPanelInstitucionalConsulta } from './aplicacion/obtener-resumen-panel-institucional.consulta';
import { PanelInstitucionalControlador } from './presentacion/http/controladores/panel-institucional.controlador';
import {
  AlertaInstitucionalTypeormEntidad,
  ComunicadoInstitucionalTypeormEntidad,
} from './infraestructura/persistencia/typeorm/entidades/panel-institucional.typeorm-entidades';
import { PanelInstitucionalTypeormConsulta } from './infraestructura/persistencia/typeorm/consultas/panel-institucional.typeorm-consulta';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlertaInstitucionalTypeormEntidad,
      ComunicadoInstitucionalTypeormEntidad,
    ]),
  ],
  controllers: [PanelInstitucionalControlador],
  providers: [
    PanelInstitucionalTypeormConsulta,
    {
      provide: ObtenerResumenPanelInstitucionalConsulta,
      useFactory: (consulta: PanelInstitucionalTypeormConsulta) =>
        new ObtenerResumenPanelInstitucionalConsulta(consulta),
      inject: [PanelInstitucionalTypeormConsulta],
    },
  ],
})
export class PanelInstitucionalModule {}
