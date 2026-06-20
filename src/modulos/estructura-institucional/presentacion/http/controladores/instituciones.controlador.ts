import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CrearInstitucionCasoUso } from '../../../aplicacion/instituciones/crear-institucion.caso-uso';
import { ListarInstitucionesConsulta } from '../../../aplicacion/instituciones/listar-instituciones.consulta';
import { ObtenerInstitucionConsulta } from '../../../aplicacion/instituciones/obtener-institucion.consulta';
import { CrearInstitucionSolicitud } from '../solicitudes/crear-institucion.solicitud';
import { InstitucionRespuesta } from '../respuestas/institucion.respuesta';

@Controller('instituciones')
export class InstitucionesControlador {
  constructor(
    private readonly crearInstitucion: CrearInstitucionCasoUso,
    private readonly listarInstituciones: ListarInstitucionesConsulta,
    private readonly obtenerInstitucion: ObtenerInstitucionConsulta,
  ) {}

  @Post()
  async crear(
    @Body() solicitud: CrearInstitucionSolicitud,
  ): Promise<InstitucionRespuesta> {
    const resultado = await this.crearInstitucion.ejecutar({
      id: crypto.randomUUID(),
      codigo: solicitud.codigo,
      nombreLegal: solicitud.nombreLegal,
      nombreCorto: solicitud.nombreCorto ?? null,
      tipoGestion: solicitud.tipoGestion ?? null,
    });
    return {
      id: resultado.id,
      codigo: solicitud.codigo,
      nombreLegal: solicitud.nombreLegal,
      nombreCorto: solicitud.nombreCorto ?? null,
      tipoGestion: solicitud.tipoGestion ?? null,
      estado: 'ACTIVA',
    };
  }

  @Get()
  async listar(): Promise<{ datos: InstitucionRespuesta[] }> {
    const instituciones = await this.listarInstituciones.ejecutar();
    return {
      datos: instituciones.map((institucion) => ({
        id: institucion.id,
        codigo: institucion.codigo,
        nombreLegal: institucion.nombreLegal,
        nombreCorto: institucion.nombreCorto,
        tipoGestion: institucion.tipoGestion,
        estado: institucion.estado,
      })),
    };
  }

  @Get(':idInstitucion')
  async obtener(
    @Param('idInstitucion') idInstitucion: string,
  ): Promise<InstitucionRespuesta | null> {
    const institucion = await this.obtenerInstitucion.ejecutar(idInstitucion);
    return institucion
      ? {
          id: institucion.id,
          codigo: institucion.codigo,
          nombreLegal: institucion.nombreLegal,
          nombreCorto: institucion.nombreCorto,
          tipoGestion: institucion.tipoGestion,
          estado: institucion.estado,
        }
      : null;
  }

  @Patch(':idInstitucion')
  actualizar(): void {
    return undefined;
  }

  @Patch(':idInstitucion/estado')
  cambiarEstado(): void {
    return undefined;
  }
}
