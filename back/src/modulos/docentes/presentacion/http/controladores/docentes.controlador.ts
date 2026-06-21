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
import { CrearDocenteCasoUso } from '../../../aplicacion/crear-docente.caso-uso';
import { ActualizarDocenteCasoUso } from '../../../aplicacion/actualizar-docente.caso-uso';
import { CambiarEstadoDocenteCasoUso } from '../../../aplicacion/cambiar-estado-docente.caso-uso';
import { AsignarDocenteSedeCasoUso } from '../../../aplicacion/asignar-docente-sede.caso-uso';
import { ActualizarAsignacionDocenteSedeCasoUso } from '../../../aplicacion/actualizar-asignacion-docente-sede.caso-uso';
import { EstablecerSedePrincipalDocenteCasoUso } from '../../../aplicacion/establecer-sede-principal-docente.caso-uso';
import { AsignarEspecialidadDocenteCasoUso } from '../../../aplicacion/asignar-especialidad-docente.caso-uso';
import { ActualizarEspecialidadDocenteCasoUso } from '../../../aplicacion/actualizar-especialidad-docente.caso-uso';
import { ListarDocentesCasoUso } from '../../../aplicacion/listar-docentes.caso-uso';
import { ObtenerDocenteCasoUso } from '../../../aplicacion/obtener-docente.caso-uso';
import { ObtenerMiPerfilDocenteCasoUso } from '../../../aplicacion/obtener-mi-perfil-docente.caso-uso';
import { CrearDocenteSolicitud } from '../solicitudes/crear-docente.solicitud';
import { ActualizarDocenteSolicitud } from '../solicitudes/actualizar-docente.solicitud';
import { CambiarEstadoDocenteSolicitud } from '../solicitudes/cambiar-estado-docente.solicitud';
import { AsignarSedeSolicitud } from '../solicitudes/asignar-sede.solicitud';
import { ActualizarAsignacionSedeSolicitud } from '../solicitudes/actualizar-asignacion-sede.solicitud';
import { AsignarEspecialidadSolicitud } from '../solicitudes/asignar-especialidad.solicitud';
import { ActualizarAsignacionEspecialidadSolicitud } from '../solicitudes/actualizar-asignacion-especialidad.solicitud';

@Controller('docentes')
export class DocentesControlador {
  constructor(
    private readonly crearDocente: CrearDocenteCasoUso,
    private readonly actualizarDocente: ActualizarDocenteCasoUso,
    private readonly cambiarEstadoDocente: CambiarEstadoDocenteCasoUso,
    private readonly asignarSede: AsignarDocenteSedeCasoUso,
    private readonly actualizarAsignacionSede: ActualizarAsignacionDocenteSedeCasoUso,
    private readonly establecerSedePrincipal: EstablecerSedePrincipalDocenteCasoUso,
    private readonly asignarEspecialidad: AsignarEspecialidadDocenteCasoUso,
    private readonly actualizarEspecialidad: ActualizarEspecialidadDocenteCasoUso,
    private readonly listarDocentes: ListarDocentesCasoUso,
    private readonly obtenerDocente: ObtenerDocenteCasoUso,
    private readonly obtenerMiPerfil: ObtenerMiPerfilDocenteCasoUso,
  ) {}

  // ── Listado y consulta ────────────────────────────────────────────────────

  @Permisos('DOCENTES.LEER')
  @Get()
  async listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query('idSede') idSede?: string,
    @Query('idEspecialidad') idEspecialidad?: string,
    @Query('estado') estado?: string,
    @Query('busqueda') busqueda?: string,
    @Query('pagina') pagina = '1',
    @Query('limite') limite = '20',
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.listarDocentes.ejecutar({
      alcance,
      idSede: idSede ?? null,
      idEspecialidad: idEspecialidad ?? null,
      estado: estado ?? null,
      busqueda: busqueda ?? null,
      pagina: Math.max(1, Number(pagina)),
      limite: Math.min(100, Math.max(1, Number(limite))),
    });
  }

  @Permisos('DOCENTES.LEER')
  @Get('mi-perfil')
  async miPerfil(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.obtenerMiPerfil.ejecutar(alcance.usuarioId, alcance.institucionId);
  }

  @Permisos('DOCENTES.LEER')
  @Get(':id')
  async obtener(
    @Param('id') id: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.obtenerDocente.ejecutar(id, alcance);
  }

  // ── Gestión de docente ────────────────────────────────────────────────────

  @Permisos('DOCENTES.CREAR')
  @Post()
  async crear(
    @Body() solicitud: CrearDocenteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.crearDocente.ejecutar({
      alcance,
      idPersona: solicitud.idPersona,
      idSede: solicitud.idSede,
      codigo: solicitud.codigo,
      fechaIngreso: solicitud.fechaIngreso ?? null,
      perfilProfesional: solicitud.perfilProfesional ?? null,
      observacion: solicitud.observacion ?? null,
    });
  }

  @Permisos('DOCENTES.ACTUALIZAR')
  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() solicitud: ActualizarDocenteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    const alcance = alcanceDesdeContexto(ctx);
    await this.actualizarDocente.ejecutar({
      alcance,
      id,
      ...solicitud,
    });
  }

  @Permisos('DOCENTES.CAMBIAR_ESTADO')
  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body() solicitud: CambiarEstadoDocenteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    const alcance = alcanceDesdeContexto(ctx);
    await this.cambiarEstadoDocente.ejecutar({
      alcance,
      id,
      estado: solicitud.estado,
      fechaCese: solicitud.fechaCese ?? null,
    });
  }

  // ── Sedes ─────────────────────────────────────────────────────────────────

  @Permisos('DOCENTES.GESTIONAR_SEDES')
  @Post(':id/sedes')
  async asignarSedeDocente(
    @Param('id') id: string,
    @Body() solicitud: AsignarSedeSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.asignarSede.ejecutar({
      alcance,
      idDocente: id,
      idSede: solicitud.idSede,
      esPrincipal: solicitud.esPrincipal,
      fechaInicio: solicitud.fechaInicio,
      observacion: solicitud.observacion ?? null,
    });
  }

  @Permisos('DOCENTES.GESTIONAR_SEDES')
  @Patch(':id/sedes/:idAsignacion')
  async actualizarAsignacionSedeDocente(
    @Param('id') id: string,
    @Param('idAsignacion') idAsignacion: string,
    @Body() solicitud: ActualizarAsignacionSedeSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    const alcance = alcanceDesdeContexto(ctx);
    await this.actualizarAsignacionSede.ejecutar({
      alcance,
      idDocente: id,
      idAsignacion,
      ...solicitud,
    });
  }

  @Permisos('DOCENTES.GESTIONAR_SEDES')
  @Post(':id/sedes/:idAsignacion/establecer-principal')
  async establecerSedePrincipalDocente(
    @Param('id') id: string,
    @Param('idAsignacion') idAsignacion: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    const alcance = alcanceDesdeContexto(ctx);
    await this.establecerSedePrincipal.ejecutar({
      alcance,
      idDocente: id,
      idAsignacion,
    });
  }

  // ── Especialidades ────────────────────────────────────────────────────────

  @Permisos('DOCENTES.GESTIONAR_ESPECIALIDADES')
  @Post(':id/especialidades')
  async asignarEspecialidadDocente(
    @Param('id') id: string,
    @Body() solicitud: AsignarEspecialidadSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const alcance = alcanceDesdeContexto(ctx);
    return this.asignarEspecialidad.ejecutar({
      alcance,
      idDocente: id,
      idEspecialidad: solicitud.idEspecialidad,
      esPrincipal: solicitud.esPrincipal,
      aniosExperiencia: solicitud.aniosExperiencia ?? null,
    });
  }

  @Permisos('DOCENTES.GESTIONAR_ESPECIALIDADES')
  @Patch(':id/especialidades/:idAsignacion')
  async actualizarEspecialidadDocente(
    @Param('id') id: string,
    @Param('idAsignacion') idAsignacion: string,
    @Body() solicitud: ActualizarAsignacionEspecialidadSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    const alcance = alcanceDesdeContexto(ctx);
    await this.actualizarEspecialidad.ejecutar({
      alcance,
      idDocente: id,
      idAsignacion,
      ...solicitud,
    });
  }
}
