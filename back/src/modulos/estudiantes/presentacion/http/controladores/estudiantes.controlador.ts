import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ListarEstudiantesConsulta } from '../../../aplicacion/listar-estudiantes.consulta';
import { ObtenerEstudianteConsulta } from '../../../aplicacion/obtener-estudiante.consulta';
import { CrearEstudianteCasoUso } from '../../../aplicacion/crear-estudiante.caso-uso';
import { ActualizarEstudianteCasoUso } from '../../../aplicacion/actualizar-estudiante.caso-uso';
import { CambiarEstadoEstudianteCasoUso } from '../../../aplicacion/cambiar-estado-estudiante.caso-uso';
import { AgregarApoderadoEstudianteCasoUso } from '../../../aplicacion/agregar-apoderado-estudiante.caso-uso';
import { ActualizarApoderadoEstudianteCasoUso } from '../../../aplicacion/actualizar-apoderado-estudiante.caso-uso';
import { RegistrarDocumentoEstudianteCasoUso } from '../../../aplicacion/registrar-documento-estudiante.caso-uso';
import {
  AgregarApoderadoEstudianteSolicitud,
  ActualizarApoderadoEstudianteSolicitud,
  ActualizarEstudianteSolicitud,
  CambiarEstadoEstudianteSolicitud,
  CrearEstudianteSolicitud,
  ListarEstudiantesSolicitud,
  RegistrarDocumentoEstudianteSolicitud,
} from '../solicitudes/estudiantes.solicitudes';

@Controller('estudiantes')
export class EstudiantesControlador {
  constructor(
    private readonly listarEstudiantes: ListarEstudiantesConsulta,
    private readonly obtenerEstudiante: ObtenerEstudianteConsulta,
    private readonly crearEstudiante: CrearEstudianteCasoUso,
    private readonly actualizarEstudiante: ActualizarEstudianteCasoUso,
    private readonly cambiarEstadoEstudiante: CambiarEstadoEstudianteCasoUso,
    private readonly agregarApoderado: AgregarApoderadoEstudianteCasoUso,
    private readonly actualizarApoderado: ActualizarApoderadoEstudianteCasoUso,
    private readonly registrarDocumento: RegistrarDocumentoEstudianteCasoUso,
  ) {}

  private contexto(
    ctx: ContextoSolicitudAutenticada | undefined,
  ): ContextoSolicitudAutenticada & { institucionId: string } {
    if (!ctx?.institucionId || !ctx.usuarioId) {
      throw new Error('CONTEXTO_NO_AUTORIZADO');
    }
    return ctx as ContextoSolicitudAutenticada & { institucionId: string };
  }

  @Permisos('ESTUDIANTES.LEER')
  @Get()
  listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() q: ListarEstudiantesSolicitud,
  ) {
    const c = this.contexto(ctx);
    return this.listarEstudiantes.ejecutar({
      institucionId: c.institucionId,
      sedeId: c.ambito === 'SEDE' ? c.sedeId : (q.idSede ?? null),
      estado: q.estado ?? null,
      busqueda: q.busqueda ?? null,
      pagina: q.pagina ?? 1,
      limite: q.limite ?? 20,
    });
  }

  @Permisos('ESTUDIANTES.LEER')
  @Get(':id')
  obtener(
    @Param('id', ParseUUIDPipe) id: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    return this.obtenerEstudiante.ejecutar(id, c.institucionId);
  }

  @Permisos('ESTUDIANTES.CREAR')
  @Post()
  crear(
    @Body() body: CrearEstudianteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    return this.crearEstudiante.ejecutar({
      institucionId: c.institucionId,
      idPersona: body.idPersona,
      idSede: body.idSede,
      codigo: body.codigo,
      fechaIngreso: body.fechaIngreso ?? null,
      observacion: body.observacion ?? null,
    });
  }

  @Permisos('ESTUDIANTES.ACTUALIZAR')
  @Patch(':id')
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActualizarEstudianteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    return this.actualizarEstudiante.ejecutar({
      institucionId: c.institucionId,
      id,
      codigo: body.codigo,
      idSede: body.idSede,
      fechaIngreso: body.fechaIngreso ?? null,
      observacion: body.observacion ?? null,
    });
  }

  @Permisos('ESTUDIANTES.CAMBIAR_ESTADO')
  @Patch(':id/estado')
  estado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CambiarEstadoEstudianteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    return this.cambiarEstadoEstudiante.ejecutar({
      institucionId: c.institucionId,
      id,
      estado: body.estado,
    });
  }

  @Permisos('ESTUDIANTES.APODERADOS.GESTIONAR')
  @Post(':id/apoderados')
  apoderado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AgregarApoderadoEstudianteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    return this.agregarApoderado.ejecutar({
      institucionId: c.institucionId,
      estudianteId: id,
      idPersona: body.idPersona,
      parentesco: body.parentesco,
      esPrincipal: body.esPrincipal,
      puedeRecoger: body.puedeRecoger,
      recibeComunicaciones: body.recibeComunicaciones,
    });
  }

  @Permisos('ESTUDIANTES.APODERADOS.GESTIONAR')
  @Patch(':id/apoderados/:idApoderado')
  apoderadoPatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('idApoderado', ParseUUIDPipe) idApoderado: string,
    @Body() body: ActualizarApoderadoEstudianteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    return this.actualizarApoderado.ejecutar({
      institucionId: c.institucionId,
      estudianteId: id,
      idApoderado,
      parentesco: body.parentesco,
      esPrincipal: body.esPrincipal,
      puedeRecoger: body.puedeRecoger,
      recibeComunicaciones: body.recibeComunicaciones,
      estado: body.estado,
    });
  }

  @Permisos('ESTUDIANTES.DOCUMENTOS.GESTIONAR')
  @Post(':id/documentos')
  documento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RegistrarDocumentoEstudianteSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    return this.registrarDocumento.ejecutar({
      institucionId: c.institucionId,
      estudianteId: id,
      tipoDocumento: body.tipoDocumento,
      nombre: body.nombre,
      fechaEmision: body.fechaEmision ?? null,
      fechaVencimiento: body.fechaVencimiento ?? null,
      observacion: body.observacion ?? null,
    });
  }
}
