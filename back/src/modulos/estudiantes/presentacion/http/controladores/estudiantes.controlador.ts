/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Param,
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
import { ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
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
  private inst(ctx: ContextoSolicitudAutenticada | undefined) {
    if (!ctx?.institucionId)
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    return ctx;
  }
  @Permisos('ESTUDIANTES.LEER')
  @Get()
  listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query() q: any,
  ) {
    const c = this.inst(ctx);
    return this.listarEstudiantes.ejecutar({
      institucionId: c.institucionId!,
      sedeId: q.idSede ?? (c.ambito === 'SEDE' ? c.sedeId : null),
      estado: q.estado ?? null,
      busqueda: q.busqueda ?? null,
      pagina: Math.max(1, Number(q.pagina ?? 1)),
      limite: Math.min(100, Math.max(1, Number(q.limite ?? 20))),
    });
  }
  @Permisos('ESTUDIANTES.LEER')
  @Get(':id')
  obtener(
    @Param('id') id: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.inst(ctx);
    return this.obtenerEstudiante.ejecutar(id, c.institucionId!);
  }
  @Permisos('ESTUDIANTES.CREAR')
  @Post()
  crear(
    @Body() b: any,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.inst(ctx);
    return this.crearEstudiante.ejecutar({
      institucionId: c.institucionId!,
      idPersona: b.idPersona,
      idSede: b.idSede,
      codigo: b.codigo,
      fechaIngreso: b.fechaIngreso ?? null,
      observacion: b.observacion ?? null,
    });
  }
  @Permisos('ESTUDIANTES.ACTUALIZAR')
  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() b: any,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.inst(ctx);
    return this.actualizarEstudiante.ejecutar({
      institucionId: c.institucionId!,
      id,
      codigo: b.codigo,
      idSede: b.idSede,
      fechaIngreso: b.fechaIngreso ?? null,
      observacion: b.observacion ?? null,
    });
  }
  @Permisos('ESTUDIANTES.CAMBIAR_ESTADO')
  @Patch(':id/estado')
  estado(
    @Param('id') id: string,
    @Body() b: any,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.inst(ctx);
    return this.cambiarEstadoEstudiante.ejecutar({
      institucionId: c.institucionId!,
      id,
      estado: b.estado,
    });
  }
  @Permisos('ESTUDIANTES.APODERADOS.GESTIONAR')
  @Post(':id/apoderados')
  apoderado(
    @Param('id') id: string,
    @Body() b: any,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.inst(ctx);
    return this.agregarApoderado.ejecutar({
      institucionId: c.institucionId!,
      estudianteId: id,
      idPersona: b.idPersona,
      parentesco: b.parentesco,
      esPrincipal: b.esPrincipal,
      puedeRecoger: b.puedeRecoger,
      recibeComunicaciones: b.recibeComunicaciones,
    });
  }
  @Permisos('ESTUDIANTES.APODERADOS.GESTIONAR')
  @Patch(':id/apoderados/:idApoderado')
  apoderadoPatch(
    @Param('id') id: string,
    @Param('idApoderado') idApoderado: string,
    @Body() b: any,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.inst(ctx);
    return this.actualizarApoderado.ejecutar({
      institucionId: c.institucionId!,
      estudianteId: id,
      idApoderado,
      parentesco: b.parentesco,
      esPrincipal: b.esPrincipal,
      puedeRecoger: b.puedeRecoger,
      recibeComunicaciones: b.recibeComunicaciones,
      estado: b.estado,
    });
  }
  @Permisos('ESTUDIANTES.DOCUMENTOS.GESTIONAR')
  @Post(':id/documentos')
  documento(
    @Param('id') id: string,
    @Body() b: any,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ) {
    const c = this.inst(ctx);
    return this.registrarDocumento.ejecutar({
      institucionId: c.institucionId!,
      estudianteId: id,
      tipoDocumento: b.tipoDocumento,
      nombre: b.nombre,
      fechaEmision: b.fechaEmision ?? null,
      fechaVencimiento: b.fechaVencimiento ?? null,
      observacion: b.observacion ?? null,
    });
  }
}
