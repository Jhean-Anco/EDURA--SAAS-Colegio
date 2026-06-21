import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { alcanceDesdeContexto } from '../alcance-desde-contexto';
import { CrearEspecialidadProfesionalCasoUso } from '../../../aplicacion/crear-especialidad-profesional.caso-uso';
import { ActualizarEspecialidadProfesionalCasoUso } from '../../../aplicacion/actualizar-especialidad-profesional.caso-uso';
import { ListarEspecialidadesCasoUso } from '../../../aplicacion/listar-especialidades.caso-uso';
import { CrearEspecialidadSolicitud } from '../solicitudes/crear-especialidad.solicitud';
import { ActualizarEspecialidadSolicitud } from '../solicitudes/actualizar-especialidad.solicitud';

@Controller('especialidades-profesionales')
export class EspecialidadesControlador {
  constructor(
    private readonly crear: CrearEspecialidadProfesionalCasoUso,
    private readonly actualizar: ActualizarEspecialidadProfesionalCasoUso,
    private readonly listar: ListarEspecialidadesCasoUso,
  ) {}

  @Permisos('ESPECIALIDADES_PROFESIONALES.LEER')
  @Get()
  async listarEspecialidades(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query('estado') estado?: string,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.listar.ejecutar(alcance, estado ?? null);
  }

  @Permisos('ESPECIALIDADES_PROFESIONALES.CREAR')
  @Post()
  async crearEspecialidad(
    @Body() solicitud: CrearEspecialidadSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.crear.ejecutar({
      alcance,
      codigo: solicitud.codigo,
      nombre: solicitud.nombre,
      descripcion: solicitud.descripcion ?? null,
    });
  }

  @Permisos('ESPECIALIDADES_PROFESIONALES.ACTUALIZAR')
  @Patch(':id')
  async actualizarEspecialidad(
    @Param('id') id: string,
    @Body() solicitud: ActualizarEspecialidadSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    const alcance = alcanceDesdeContexto(ctx);
    await this.actualizar.ejecutar({
      alcance,
      id,
      ...solicitud,
    });
  }
}
