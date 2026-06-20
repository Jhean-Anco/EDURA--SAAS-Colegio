import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GuardiaJwt } from '../../../../identidad-acceso/presentacion/http/guardias/guardia-jwt';
import { GuardiaPermisos } from '../../../../../compartido/presentacion/http/guardias/guardia-permisos';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { CrearPersonaCasoUso } from '../../../aplicacion/personas/crear-persona.caso-uso';
import { ListarPersonasConsulta } from '../../../aplicacion/personas/listar-personas.consulta';
import { ObtenerPersonaConsulta } from '../../../aplicacion/personas/obtener-persona.consulta';
import { CrearPersonaSolicitud } from '../solicitudes/crear-persona.solicitud';
import { Persona } from '../../../dominio/personas/persona';

@UseGuards(GuardiaJwt, GuardiaPermisos)
@Controller('personas')
export class PersonasControlador {
  constructor(
    private readonly crearPersona: CrearPersonaCasoUso,
    private readonly obtenerPersona: ObtenerPersonaConsulta,
    private readonly listarPersonas: ListarPersonasConsulta,
  ) {}

  private extraerInstitucionId(
    ctx: ContextoSolicitudAutenticada | undefined,
  ): string {
    if (!ctx?.institucionId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    return ctx.institucionId;
  }

  @Permisos('PERSONAS.CREAR')
  @Post()
  crear(
    @Body() entrada: CrearPersonaSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<Persona> {
    const fechaNac = entrada.fechaNacimiento
      ? new Date(entrada.fechaNacimiento)
      : null;
    return this.crearPersona.ejecutar({
      institucionEducativaId: this.extraerInstitucionId(ctx),
      nombres: entrada.nombres,
      apellidoPaterno: entrada.apellidoPaterno ?? null,
      apellidoMaterno: entrada.apellidoMaterno ?? null,
      fechaNacimiento: fechaNac,
      sexoRegistral: entrada.sexoRegistral ?? null,
      codigoPaisNacionalidad: entrada.codigoPaisNacionalidad ?? null,
    });
  }

  @Permisos('PERSONAS.LEER')
  @Get()
  listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
    @Query('pagina') pagina = '1',
    @Query('tamano') tamano = '20',
    @Query('estado') estado?: string,
    @Query('texto') texto?: string,
  ): Promise<{ datos: Persona[]; total: number }> {
    return this.listarPersonas.ejecutar(this.extraerInstitucionId(ctx), {
      pagina: Number(pagina),
      tamano: Number(tamano),
      estado,
      texto,
    });
  }

  @Permisos('PERSONAS.LEER')
  @Get(':idPersona')
  obtener(
    @Param('idPersona', ParseUUIDPipe) idPersona: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<Persona | null> {
    return this.obtenerPersona.ejecutar(
      idPersona,
      this.extraerInstitucionId(ctx),
    );
  }
}
