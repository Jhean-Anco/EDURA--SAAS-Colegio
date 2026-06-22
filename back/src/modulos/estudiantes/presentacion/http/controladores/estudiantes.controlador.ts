import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  private contexto(
    ctx: ContextoSolicitudAutenticada | undefined,
  ): ContextoSolicitudAutenticada & { institucionId: string } {
    if (!ctx?.institucionId || !ctx.usuarioId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    return ctx as ContextoSolicitudAutenticada & { institucionId: string };
  }

  private async validarPropiedadEstudiante(
    c: ContextoSolicitudAutenticada & { institucionId: string },
    estudianteId: string,
  ): Promise<void> {
    const query = `
      SELECT r.codigo as "rolCodigo", m.id_persona as "personaId"
      FROM asignaciones_rol_usuario a
      JOIN roles r ON a.id_rol = r.id
      JOIN membresias_institucion m ON a.id_membresia_institucion = m.id
      WHERE a.id_usuario = $1 AND m.id_institucion_educativa = $2 AND a.id_rol = $3
    `;
    const res = await this.dataSource.query(query, [c.usuarioId, c.institucionId, c.rolId]);
    if (!res || res.length === 0) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const { rolCodigo, personaId } = res[0];

    if (rolCodigo === 'ESTUDIANTE') {
      const studentRes = await this.dataSource.query(
        `SELECT id FROM estudiantes WHERE id_persona = $1 AND id_institucion_educativa = $2`,
        [personaId, c.institucionId]
      );
      if (!studentRes || studentRes.length === 0 || studentRes[0].id !== estudianteId) {
        throw new ForbiddenException('ACCESO_DENEGADO');
      }
    } else if (rolCodigo === 'APODERADO') {
      const parentRes = await this.dataSource.query(
        `SELECT id FROM apoderados_estudiante WHERE id_persona = $1 AND id_estudiante = $2 AND id_institucion_educativa = $3`,
        [personaId, estudianteId, c.institucionId]
      );
      if (!parentRes || parentRes.length === 0) {
        throw new ForbiddenException('ACCESO_DENEGADO');
      }
    }
  }

  @Permisos('ESTUDIANTES.LEER', 'ESTUDIANTES.MI_PERFIL.LEER', 'APODERADOS.MIS_ESTUDIANTES.LEER')
  @Get()
  async listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() q: ListarEstudiantesSolicitud,
  ) {
    const c = this.contexto(ctx);

    const query = `
      SELECT r.codigo as "rolCodigo", m.id_persona as "personaId"
      FROM asignaciones_rol_usuario a
      JOIN roles r ON a.id_rol = r.id
      JOIN membresias_institucion m ON a.id_membresia_institucion = m.id
      WHERE a.id_usuario = $1 AND m.id_institucion_educativa = $2 AND a.id_rol = $3
    `;
    const res = await this.dataSource.query(query, [c.usuarioId, c.institucionId, c.rolId]);
    if (!res || res.length === 0) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const { rolCodigo, personaId } = res[0];

    if (rolCodigo === 'ESTUDIANTE') {
      const studentRes = await this.dataSource.query(
        `SELECT id FROM estudiantes WHERE id_persona = $1 AND id_institucion_educativa = $2`,
        [personaId, c.institucionId]
      );
      if (!studentRes || studentRes.length === 0) {
        return { total: 0, paginas: 0, pagina: 1, limite: 20, data: [] };
      }
      return this.listarEstudiantes.ejecutar({
        institucionId: c.institucionId,
        sedeId: c.ambito === 'SEDE' ? c.sedeId : null,
        estado: null,
        busqueda: studentRes[0].id,
        pagina: 1,
        limite: 1,
      });
    } else if (rolCodigo === 'APODERADO') {
      const parentRes = await this.dataSource.query(
        `SELECT id_estudiante as "id" FROM apoderados_estudiante WHERE id_persona = $1 AND id_institucion_educativa = $2`,
        [personaId, c.institucionId]
      );
      if (!parentRes || parentRes.length === 0) {
        return { total: 0, paginas: 0, pagina: 1, limite: 20, data: [] };
      }
      const studentIds = parentRes.map((r: any) => r.id);
      const result = await this.listarEstudiantes.ejecutar({
        institucionId: c.institucionId,
        sedeId: c.ambito === 'SEDE' ? c.sedeId : null,
        estado: null,
        busqueda: null,
        pagina: 1,
        limite: 100,
      });
      result.data = result.data.filter((est: any) => studentIds.includes(est.id));
      result.total = result.data.length;
      return result;
    }

    return this.listarEstudiantes.ejecutar({
      institucionId: c.institucionId,
      sedeId: c.ambito === 'SEDE' ? c.sedeId : (q.idSede ?? null),
      estado: q.estado ?? null,
      busqueda: q.busqueda ?? null,
      pagina: q.pagina ?? 1,
      limite: q.limite ?? 20,
    });
  }

  @Permisos('ESTUDIANTES.LEER', 'ESTUDIANTES.MI_PERFIL.LEER', 'APODERADOS.MIS_ESTUDIANTES.LEER')
  @Get(':id')
  async obtener(
    @Param('id', ParseUUIDPipe) id: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.contexto(ctx);
    await this.validarPropiedadEstudiante(c, id);
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
