import { Body, Controller, Param, Put } from '@nestjs/common';
import { RegistrarDireccionSedeCasoUso } from '../../../aplicacion/direcciones-sede/registrar-direccion-sede.caso-uso';
import { RegistrarDireccionSedeSolicitud } from '../solicitudes/registrar-direccion-sede.solicitud';

@Controller('instituciones/:idInstitucion/sedes/:idSede/direccion')
export class DireccionesControlador {
  constructor(private readonly registrar: RegistrarDireccionSedeCasoUso) {}

  @Put()
  async registrarDireccion(
    @Param('idInstitucion') idInstitucion: string,
    @Param('idSede') idSede: string,
    @Body() solicitud: RegistrarDireccionSedeSolicitud,
  ): Promise<void> {
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
