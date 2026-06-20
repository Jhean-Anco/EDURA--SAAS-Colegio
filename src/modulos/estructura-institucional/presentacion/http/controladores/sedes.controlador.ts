import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import {
  validarInstitucionDelContexto,
  validarSedeDelContexto,
} from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { CambiarEstadoSedeCasoUso } from '../../../aplicacion/sedes/cambiar-estado-sede.caso-uso';
import { CrearSedeCasoUso } from '../../../aplicacion/sedes/crear-sede.caso-uso';
import { EstablecerSedePrincipalCasoUso } from '../../../aplicacion/sedes/establecer-sede-principal.caso-uso';
import { ListarSedesInstitucionConsulta } from '../../../aplicacion/sedes/listar-sedes-institucion.consulta';
import { ObtenerSedeConsulta } from '../../../aplicacion/sedes/obtener-sede.consulta';
import { CrearSedeSolicitud } from '../solicitudes/crear-sede.solicitud';
import { SedeRespuesta } from '../respuestas/sede.respuesta';

@Controller('instituciones/:idInstitucion/sedes')
export class SedesControlador {
  constructor(
    private readonly crearSede: CrearSedeCasoUso,
    private readonly listarSedes: ListarSedesInstitucionConsulta,
    private readonly obtenerSede: ObtenerSedeConsulta,
    private readonly establecerPrincipal: EstablecerSedePrincipalCasoUso,
    private readonly cambiarEstado: CambiarEstadoSedeCasoUso,
  ) {}

  @Permisos('SEDES.CREAR')
  @Post()
  async crear(
    @Param('idInstitucion') idInstitucion: string,
    @Body() solicitud: CrearSedeSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<SedeRespuesta> {
    validarInstitucionDelContexto(ctx, idInstitucion);
    return this.crearSede.ejecutar({
      id: crypto.randomUUID(),
      institucionId: idInstitucion,
      codigo: solicitud.codigo,
      nombre: solicitud.nombre,
    });
  }

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idInstitucion') idInstitucion: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<{ datos: SedeRespuesta[] }> {
    validarInstitucionDelContexto(ctx, idInstitucion);
    const sedes = await this.listarSedes.ejecutar(idInstitucion);
    return {
      datos: sedes.map((sede) => ({
        id: sede.id,
        institucionId: sede.institucionId,
        codigo: sede.codigo,
        nombre: sede.nombre,
        esPrincipal: sede.esPrincipal,
        estado: sede.estado,
      })),
    };
  }

  @Permisos('SEDES.LEER')
  @Get(':idSede')
  async obtener(
    @Param('idInstitucion') idInstitucion: string,
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<SedeRespuesta> {
    validarSedeDelContexto(ctx, idInstitucion, idSede);
    const sede = await this.obtenerSede.ejecutar(idInstitucion, idSede);
    return {
      id: sede.id,
      institucionId: sede.institucionId,
      codigo: sede.codigo,
      nombre: sede.nombre,
      esPrincipal: sede.esPrincipal,
      estado: sede.estado,
    };
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Post(':idSede/establecer-principal')
  async establecerPrincipalSede(
    @Param('idInstitucion') idInstitucion: string,
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    validarSedeDelContexto(ctx, idInstitucion, idSede);
    await this.establecerPrincipal.ejecutar(idInstitucion, idSede);
  }

  @Permisos('SEDES.ACTUALIZAR')
  @Patch(':idSede/estado')
  async cambiarEstadoSede(
    @Param('idInstitucion') idInstitucion: string,
    @Param('idSede') idSede: string,
    @Body() solicitud: { estado: 'ACTIVA' | 'INACTIVA' | 'BAJA' },
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    validarSedeDelContexto(ctx, idInstitucion, idSede);
    await this.cambiarEstado.ejecutar(idInstitucion, idSede, solicitud.estado);
  }
}
