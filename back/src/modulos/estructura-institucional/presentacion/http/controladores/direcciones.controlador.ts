import { Body, Controller, Param, Put } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { RegistrarDireccionSedeCasoUso } from '../../../aplicacion/direcciones-sede/registrar-direccion-sede.caso-uso';
import { RegistrarDireccionSedeSolicitud } from '../solicitudes/registrar-direccion-sede.solicitud';

@Controller('instituciones/:idInstitucion/sedes/:idSede/direccion')
export class DireccionesControlador {
  constructor(private readonly registrar: RegistrarDireccionSedeCasoUso) {}

  @Permisos('SEDES.ACTUALIZAR')
  @Put()
  async registrarDireccion(
    @Param('idInstitucion') idInstitucion: string,
    @Param('idSede') idSede: string,
    @Body() solicitud: RegistrarDireccionSedeSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    validarSedeDelContexto(ctx, idInstitucion, idSede);
    await this.registrar.ejecutar({
      id: crypto.randomUUID(),
      institucionId: idInstitucion,
      sedeId: idSede,
      direccionLinea: solicitud.direccionLinea,
      referencia: solicitud.referencia ?? null,
      idUbigeo: solicitud.idUbigeo ?? null,
      latitud: solicitud.latitud ?? null,
      longitud: solicitud.longitud ?? null,
      codigoPostal: solicitud.codigoPostal ?? null,
    });
  }
}
