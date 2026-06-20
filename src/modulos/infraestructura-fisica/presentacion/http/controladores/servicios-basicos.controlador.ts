import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { CambiarEstadoServicioBasicoCasoUso } from '../../../aplicacion/servicios-basicos/cambiar-estado-servicio-basico.caso-uso';
import { ListarServiciosBasicosSedeConsulta } from '../../../aplicacion/servicios-basicos/listar-servicios-basicos-sede.consulta';
import { RegistrarServicioBasicoSedeCasoUso } from '../../../aplicacion/servicios-basicos/registrar-servicio-basico-sede.caso-uso';
import { ServicioBasicoSedeRespuesta } from '../../../dominio/servicios-basicos/servicio-basico.respuesta';
import { CambiarEstadoServicioBasicoSolicitud } from '../solicitudes/cambiar-estado-servicio-basico.solicitud';
import { RegistrarServicioBasicoSedeSolicitud } from '../solicitudes/registrar-servicio-basico.solicitud';

@Controller('sedes/:idSede/servicios-basicos')
export class ServiciosBasicosControlador {
  constructor(
    private readonly registrarServicioBasico: RegistrarServicioBasicoSedeCasoUso,
    private readonly listarServiciosBasicos: ListarServiciosBasicosSedeConsulta,
    private readonly cambiarEstadoServicioBasico: CambiarEstadoServicioBasicoCasoUso,
  ) {}

  @Permisos('INFRAESTRUCTURA.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
  ): Promise<ServicioBasicoSedeRespuesta[]> {
    return this.listarServiciosBasicos.ejecutar(idSede);
  }

  @Permisos('INFRAESTRUCTURA.GESTIONAR')
  @Post()
  async crear(
    @Param('idSede') idSede: string,
    @Body() solicitud: RegistrarServicioBasicoSedeSolicitud,
  ): Promise<ServicioBasicoSedeRespuesta> {
    return this.registrarServicioBasico.ejecutar({
      id: crypto.randomUUID(),
      sedeId: idSede,
      tipoServicioCodigo: solicitud.tipoServicioCodigo,
      proveedor: solicitud.proveedor ?? null,
      numeroSuministro: solicitud.numeroSuministro ?? null,
    });
  }

  @Permisos('INFRAESTRUCTURA.GESTIONAR')
  @Patch(':idServicio')
  async cambiarEstado(
    @Param('idServicio') idServicio: string,
    @Body() solicitud: CambiarEstadoServicioBasicoSolicitud,
  ): Promise<ServicioBasicoSedeRespuesta> {
    return this.cambiarEstadoServicioBasico.ejecutar(
      idServicio,
      solicitud.estadoServicio,
    );
  }
}
