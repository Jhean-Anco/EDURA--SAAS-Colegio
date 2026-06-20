import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearSedeCasoUso } from '../../../aplicacion/sedes/crear-sede.caso-uso';
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
  ) {}

  @Post()
  async crear(
    @Param('idInstitucion') idInstitucion: string,
    @Body() solicitud: CrearSedeSolicitud,
  ): Promise<SedeRespuesta> {
    return this.crearSede.ejecutar({
      id: crypto.randomUUID(),
      institucionId: idInstitucion,
      codigo: solicitud.codigo,
      nombre: solicitud.nombre,
    });
  }

  @Get()
  async listar(
    @Param('idInstitucion') idInstitucion: string,
  ): Promise<{ datos: SedeRespuesta[] }> {
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

  @Get(':idSede')
  async obtener(
    @Param('idInstitucion') idInstitucion: string,
    @Param('idSede') idSede: string,
  ): Promise<SedeRespuesta | null> {
    const sede = await this.obtenerSede.ejecutar(idSede);
    if (!sede || sede.institucionId !== idInstitucion) return null;
    return {
      id: sede.id,
      institucionId: sede.institucionId,
      codigo: sede.codigo,
      nombre: sede.nombre,
      esPrincipal: sede.esPrincipal,
      estado: sede.estado,
    };
  }
}
