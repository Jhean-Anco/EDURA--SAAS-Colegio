import { Body, Controller, Get, Post } from '@nestjs/common';
import { IniciarSesionCasoUso } from '../../../aplicacion/autenticacion/iniciar-sesion.caso-uso';
import { ListarContextosUsuarioConsulta } from '../../../aplicacion/consultas/contexto-acceso';
import { IniciarSesionSolicitud } from '../solicitudes/iniciar-sesion.solicitud';
import { AutenticacionRespuesta } from '../respuestas/autenticacion.respuesta';
import { ContextoAccesoRespuesta } from '../respuestas/contexto-acceso.respuesta';

@Controller('api/v1/autenticacion')
export class AutenticacionControlador {
  constructor(
    private readonly iniciarSesion: IniciarSesionCasoUso,
    private readonly listarContextos: ListarContextosUsuarioConsulta,
  ) {}

  @Post('iniciar-sesion')
  async iniciar(
    @Body() solicitud: IniciarSesionSolicitud,
  ): Promise<AutenticacionRespuesta> {
    return this.iniciarSesion.ejecutar(solicitud);
  }

  @Get('contextos')
  async contextos(): Promise<ContextoAccesoRespuesta[]> {
    return this.listarContextos.ejecutar('mock');
  }
}
