import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { CambiarEstadoServicioBasicoCasoUso } from '../../../aplicacion/servicios-basicos/cambiar-estado-servicio-basico.caso-uso';
import { ListarServiciosBasicosSedeConsulta } from '../../../aplicacion/servicios-basicos/listar-servicios-basicos-sede.consulta';
import { RegistrarServicioBasicoSedeCasoUso } from '../../../aplicacion/servicios-basicos/registrar-servicio-basico-sede.caso-uso';
import { ServicioBasicoSedeRespuesta } from '../../../dominio/servicios-basicos/servicio-basico.respuesta';
import { CambiarEstadoServicioBasicoSolicitud } from '../solicitudes/cambiar-estado-servicio-basico.solicitud';
import { RegistrarServicioBasicoSedeSolicitud } from '../solicitudes/registrar-servicio-basico.solicitud';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../../estructura-institucional/dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/servicios-basicos')
export class ServiciosBasicosControlador {
  constructor(
    private readonly registrarServicioBasico: RegistrarServicioBasicoSedeCasoUso,
    private readonly listarServiciosBasicos: ListarServiciosBasicosSedeConsulta,
    private readonly cambiarEstadoServicioBasico: CambiarEstadoServicioBasicoCasoUso,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('INFRAESTRUCTURA.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<ServicioBasicoSedeRespuesta[]> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    validarSedeDelContexto(ctx, sede.institucionId, idSede);
    return this.listarServiciosBasicos.ejecutar(idSede);
  }

  @Permisos('INFRAESTRUCTURA.GESTIONAR')
  @Post()
  async crear(
    @Param('idSede') idSede: string,
    @Body() solicitud: RegistrarServicioBasicoSedeSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<ServicioBasicoSedeRespuesta> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    validarSedeDelContexto(ctx, sede.institucionId, idSede);
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
    @Param('idSede') idSede: string,
    @Param('idServicio') idServicio: string,
    @Body() solicitud: CambiarEstadoServicioBasicoSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<ServicioBasicoSedeRespuesta> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    validarSedeDelContexto(ctx, sede.institucionId, idSede);
    return this.cambiarEstadoServicioBasico.ejecutar(
      idServicio,
      idSede,
      solicitud.estadoServicio,
    );
  }
}
