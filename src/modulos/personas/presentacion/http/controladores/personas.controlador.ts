import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { CrearPersonaCasoUso } from '../../../aplicacion/personas/crear-persona.caso-uso';
import { ListarPersonasConsulta } from '../../../aplicacion/personas/listar-personas.consulta';
import { ObtenerPersonaConsulta } from '../../../aplicacion/personas/obtener-persona.consulta';
import { CrearPersonaSolicitud } from '../solicitudes/crear-persona.solicitud';
import { GuardiaJwt } from '../../../../identidad-acceso/presentacion/http/guardias/guardia-jwt';
import { GuardiaPermisos } from '../../../../../compartido/presentacion/http/guardias/guardia-permisos';
import { PayloadAcceso } from '../../../../identidad-acceso/dominio/valores/payload-acceso';
import { Request } from 'express';

@UseGuards(GuardiaJwt, GuardiaPermisos)
@Controller('personas')
export class PersonasControlador {
  constructor(
    private readonly crearPersona: CrearPersonaCasoUso,
    private readonly obtenerPersona: ObtenerPersonaConsulta,
    private readonly listarPersonas: ListarPersonasConsulta,
  ) {}

  private obtenerInstitucion(request: { usuario?: PayloadAcceso }): string {
    const institucionId = request.usuario?.institucionId;
    if (!institucionId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    return institucionId;
  }

  @Permisos('PERSONAS.CREAR')
  @Post()
  crear(
    @Body() entrada: CrearPersonaSolicitud,
    @Req() request: Request & { usuario?: PayloadAcceso },
  ) {
    return this.crearPersona.ejecutar({
      institucionEducativaId: this.obtenerInstitucion(request),
      nombres: entrada.nombres,
      apellidoPaterno: entrada.apellidoPaterno,
    });
  }

  @Permisos('PERSONAS.LEER')
  @Get()
  listar(
    @Req() request: Request & { usuario?: PayloadAcceso },
    @Query('institucionEducativaId') institucionEducativaId: string,
    @Query('pagina') pagina = '1',
    @Query('tamano') tamano = '20',
  ) {
    return this.listarPersonas.ejecutar(
      institucionEducativaId || this.obtenerInstitucion(request),
      {
        pagina: Number(pagina),
        tamano: Number(tamano),
      },
    );
  }

  @Permisos('PERSONAS.LEER')
  @Get(':idPersona')
  obtener(@Param('idPersona', ParseUUIDPipe) idPersona: string) {
    return this.obtenerPersona.ejecutar(idPersona);
  }
}
