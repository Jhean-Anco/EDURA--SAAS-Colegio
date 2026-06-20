import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ActualizarInstitucionCasoUso } from '../../../aplicacion/instituciones/actualizar-institucion.caso-uso';
import { CambiarEstadoInstitucionCasoUso } from '../../../aplicacion/instituciones/cambiar-estado-institucion.caso-uso';
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
    private readonly actualizarInstitucion: ActualizarInstitucionCasoUso,
    private readonly cambiarEstadoInstitucion: CambiarEstadoInstitucionCasoUso,
  ) {}

  @Permisos('INSTITUCIONES.CREAR')
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

  @Permisos('INSTITUCIONES.LEER')
  @Get()
  async listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<{ datos: InstitucionRespuesta[] }> {
    const instituciones = await this.listarInstituciones.ejecutar(ctx);
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

  @Permisos('INSTITUCIONES.LEER')
  @Get(':idInstitucion')
  async obtener(
    @Param('idInstitucion') idInstitucion: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<InstitucionRespuesta> {
    const institucion = await this.obtenerInstitucion.ejecutar(
      idInstitucion,
      ctx,
    );
    return {
      id: institucion.id,
      codigo: institucion.codigo,
      nombreLegal: institucion.nombreLegal,
      nombreCorto: institucion.nombreCorto,
      tipoGestion: institucion.tipoGestion,
      estado: institucion.estado,
    };
  }

  @Permisos('INSTITUCIONES.ACTUALIZAR')
  @Patch(':idInstitucion')
  async actualizar(
    @Param('idInstitucion') idInstitucion: string,
    @Body() solicitud: CrearInstitucionSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    await this.actualizarInstitucion.ejecutar(
      {
        id: idInstitucion,
        nombreLegal: solicitud.nombreLegal,
        nombreCorto: solicitud.nombreCorto ?? null,
        tipoGestion: solicitud.tipoGestion ?? null,
      },
      ctx,
    );
  }

  @Permisos('INSTITUCIONES.ACTUALIZAR')
  @Patch(':idInstitucion/estado')
  async cambiarEstado(
    @Param('idInstitucion') idInstitucion: string,
    @Body() solicitud: { estado: 'ACTIVA' | 'INACTIVA' | 'BAJA' },
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    await this.cambiarEstadoInstitucion.ejecutar(
      idInstitucion,
      solicitud.estado,
      ctx,
    );
  }
}
