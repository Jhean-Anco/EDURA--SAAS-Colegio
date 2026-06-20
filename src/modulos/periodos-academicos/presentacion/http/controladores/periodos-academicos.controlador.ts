import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { CrearAnioAcademicoCasoUso } from '../../../aplicacion/anios/crear-anio-academico.caso-uso';
import { CambiarEstadoAnioCasoUso } from '../../../aplicacion/anios/cambiar-estado-anio.caso-uso';
import { ListarAniosConsulta } from '../../../aplicacion/anios/listar-anios.consulta';
import { ObtenerAnioConsulta } from '../../../aplicacion/anios/obtener-anio.consulta';
import { CrearPeriodoAcademicoCasoUso } from '../../../aplicacion/periodos/crear-periodo-academico.caso-uso';
import { CambiarEstadoPeriodoCasoUso } from '../../../aplicacion/periodos/cambiar-estado-periodo.caso-uso';
import { ListarPeriodosConsulta } from '../../../aplicacion/periodos/listar-periodos.consulta';
import {
  CrearAnioAcademicoSolicitud,
  CambiarEstadoAnioSolicitud,
  CrearPeriodoAcademicoSolicitud,
  CambiarEstadoPeriodoSolicitud,
} from '../solicitudes/periodos-academicos.solicitudes';

type RequestAutenticada = Request & {
  contextoActual?: ContextoSolicitudAutenticada;
};

@Controller('anios-academicos')
export class PeriodosAcademicosControlador {
  constructor(
    private readonly crearAnio: CrearAnioAcademicoCasoUso,
    private readonly cambiarEstadoAnio: CambiarEstadoAnioCasoUso,
    private readonly listarAnios: ListarAniosConsulta,
    private readonly obtenerAnio: ObtenerAnioConsulta,
    private readonly crearPeriodo: CrearPeriodoAcademicoCasoUso,
    private readonly cambiarEstadoPeriodo: CambiarEstadoPeriodoCasoUso,
    private readonly listarPeriodos: ListarPeriodosConsulta,
  ) {}

  @Permisos('PERIODOS.LEER')
  @Get()
  async listar(@Req() req: RequestAutenticada) {
    const institucionId = req.contextoActual!.institucionId!;
    const anios = await this.listarAnios.ejecutar(institucionId);
    return { datos: anios };
  }

  @Permisos('PERIODOS.CREAR')
  @Post()
  async crear(
    @Req() req: RequestAutenticada,
    @Body() solicitud: CrearAnioAcademicoSolicitud,
  ) {
    const institucionId = req.contextoActual!.institucionId!;
    return this.crearAnio.ejecutar({
      id: crypto.randomUUID(),
      institucionId,
      nombre: solicitud.nombre,
      anio: solicitud.anio,
      fechaInicio: new Date(solicitud.fechaInicio),
      fechaFin: new Date(solicitud.fechaFin),
    });
  }

  @Permisos('PERIODOS.LEER')
  @Get(':idAnio')
  async obtener(
    @Req() req: RequestAutenticada,
    @Param('idAnio') idAnio: string,
  ) {
    const institucionId = req.contextoActual!.institucionId!;
    return this.obtenerAnio.ejecutar(idAnio, institucionId);
  }

  @Permisos('PERIODOS.GESTIONAR')
  @Patch(':idAnio/estado')
  async cambiarEstadoAnioAcademico(
    @Req() req: RequestAutenticada,
    @Param('idAnio') idAnio: string,
    @Body() solicitud: CambiarEstadoAnioSolicitud,
  ) {
    const institucionId = req.contextoActual!.institucionId!;
    await this.cambiarEstadoAnio.ejecutar(
      idAnio,
      institucionId,
      solicitud.estado,
    );
  }

  @Permisos('PERIODOS.LEER')
  @Get(':idAnio/periodos')
  async listarPeriodosDeAnio(
    @Req() req: RequestAutenticada,
    @Param('idAnio') idAnio: string,
  ) {
    const institucionId = req.contextoActual!.institucionId!;
    const periodos = await this.listarPeriodos.ejecutar(idAnio, institucionId);
    return { datos: periodos };
  }

  @Permisos('PERIODOS.CREAR')
  @Post(':idAnio/periodos')
  async registrarPeriodo(
    @Req() req: RequestAutenticada,
    @Param('idAnio') idAnio: string,
    @Body() solicitud: CrearPeriodoAcademicoSolicitud,
  ) {
    const institucionId = req.contextoActual!.institucionId!;
    return this.crearPeriodo.ejecutar({
      id: crypto.randomUUID(),
      anioAcademicoId: idAnio,
      institucionId,
      nombre: solicitud.nombre,
      tipo: solicitud.tipo,
      orden: solicitud.orden,
      fechaInicio: new Date(solicitud.fechaInicio),
      fechaFin: new Date(solicitud.fechaFin),
    });
  }

  @Permisos('PERIODOS.GESTIONAR')
  @Patch(':idAnio/periodos/:idPeriodo/estado')
  async cambiarEstadoPeriodoAcademico(
    @Req() req: RequestAutenticada,
    @Param('idPeriodo') idPeriodo: string,
    @Body() solicitud: CambiarEstadoPeriodoSolicitud,
  ) {
    const institucionId = req.contextoActual!.institucionId!;
    await this.cambiarEstadoPeriodo.ejecutar(
      idPeriodo,
      institucionId,
      solicitud.estado,
    );
  }
}
