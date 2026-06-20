import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CambiarEstadoServicioBasicoCasoUso } from '../../../aplicacion/servicios-basicos/cambiar-estado-servicio-basico.caso-uso';
import { ListarServiciosBasicosSedeConsulta } from '../../../aplicacion/servicios-basicos/listar-servicios-basicos-sede.consulta';
import { RegistrarServicioBasicoSedeCasoUso } from '../../../aplicacion/servicios-basicos/registrar-servicio-basico-sede.caso-uso';
import { CambiarEstadoServicioBasicoSolicitud } from '../solicitudes/cambiar-estado-servicio-basico.solicitud';
import { RegistrarServicioBasicoSedeSolicitud } from '../solicitudes/registrar-servicio-basico.solicitud';
import { ServicioBasicoSedeTypeormEntidad } from '../../../infraestructura/persistencia/typeorm/entidades/servicio-basico-sede.typeorm-entidad';

@Controller('sedes/:idSede/servicios-basicos')
export class ServiciosBasicosControlador {
  constructor(
    private readonly registrarServicioBasico: RegistrarServicioBasicoSedeCasoUso,
    private readonly listarServiciosBasicos: ListarServiciosBasicosSedeConsulta,
    private readonly cambiarEstadoServicioBasico: CambiarEstadoServicioBasicoCasoUso,
  ) {}

  @Get()
  async listar(
    @Param('idSede') idSede: string,
  ): Promise<ServicioBasicoSedeTypeormEntidad[]> {
    return this.listarServiciosBasicos.ejecutar(idSede);
  }

  @Post()
  async crear(
    @Param('idSede') idSede: string,
    @Body() solicitud: RegistrarServicioBasicoSedeSolicitud,
  ): Promise<ServicioBasicoSedeTypeormEntidad> {
    return this.registrarServicioBasico.ejecutar({
      id: crypto.randomUUID(),
      sedeId: idSede,
      tipoServicioCodigo: solicitud.tipoServicioCodigo,
      proveedor: solicitud.proveedor ?? null,
      numeroSuministro: solicitud.numeroSuministro ?? null,
    });
  }

  @Patch(':idServicio')
  async cambiarEstado(
    @Param('idServicio') idServicio: string,
    @Body() solicitud: CambiarEstadoServicioBasicoSolicitud,
  ): Promise<ServicioBasicoSedeTypeormEntidad> {
    return this.cambiarEstadoServicioBasico.ejecutar(
      idServicio,
      solicitud.estadoServicio,
    );
  }
}
