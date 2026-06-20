import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
import { RegistrarDocumentoPersonaCasoUso } from '../../../aplicacion/documentos-identidad/registrar-documento-persona.caso-uso';
import { RegistrarMedioContactoPersonaCasoUso } from '../../../aplicacion/medios-contacto/registrar-medio-contacto-persona.caso-uso';
import { RegistrarDireccionPersonaCasoUso } from '../../../aplicacion/direcciones/registrar-direccion-persona.caso-uso';
import { VincularPersonaMembresiaCasoUso } from '../../../aplicacion/vinculaciones/vincular-persona-membresia.caso-uso';
import { CrearPersonaSolicitud } from '../solicitudes/crear-persona.solicitud';
import { RegistrarDocumentoSolicitud } from '../solicitudes/registrar-documento.solicitud';
import { RegistrarContactoSolicitud } from '../solicitudes/registrar-contacto.solicitud';
import { RegistrarDireccionSolicitud } from '../solicitudes/registrar-direccion.solicitud';
import { VincularMembresiaSolicitud } from '../solicitudes/vincular-membresia.solicitud';
import { Persona } from '../../../dominio/personas/persona';

@UseGuards(GuardiaJwt, GuardiaPermisos)
@Controller('personas')
export class PersonasControlador {
  constructor(
    private readonly crearPersona: CrearPersonaCasoUso,
    private readonly obtenerPersona: ObtenerPersonaConsulta,
    private readonly listarPersonas: ListarPersonasConsulta,
    private readonly registrarDocumento: RegistrarDocumentoPersonaCasoUso,
    private readonly registrarContacto: RegistrarMedioContactoPersonaCasoUso,
    private readonly registrarDireccion: RegistrarDireccionPersonaCasoUso,
    private readonly vincularMembresia: VincularPersonaMembresiaCasoUso,
  ) {}

  private instId(ctx: ContextoSolicitudAutenticada | undefined): string {
    if (!ctx?.institucionId) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    return ctx.institucionId;
  }

  @Permisos('PERSONAS.CREAR')
  @Post()
  crear(
    @Body() cuerpo: CrearPersonaSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<Persona> {
    const fechaNac = cuerpo.fechaNacimiento
      ? new Date(cuerpo.fechaNacimiento)
      : null;
    return this.crearPersona.ejecutar({
      institucionEducativaId: this.instId(ctx),
      nombres: cuerpo.nombres,
      apellidoPaterno: cuerpo.apellidoPaterno ?? null,
      apellidoMaterno: cuerpo.apellidoMaterno ?? null,
      fechaNacimiento: fechaNac,
      sexoRegistral: cuerpo.sexoRegistral ?? null,
      codigoPaisNacionalidad: cuerpo.codigoPaisNacionalidad ?? null,
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
    const pag = Math.max(1, Number(pagina));
    const tam = Math.min(100, Math.max(1, Number(tamano)));
    return this.listarPersonas.ejecutar(this.instId(ctx), {
      pagina: pag,
      tamano: tam,
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
    return this.obtenerPersona
      .ejecutar(idPersona, this.instId(ctx))
      .then((persona) => {
        if (!persona) {
          throw new NotFoundException('RECURSO_NO_ENCONTRADO');
        }
        return persona;
      });
  }

  @Permisos('PERSONAS.GESTIONAR_DOCUMENTOS')
  @Post(':idPersona/documentos')
  @HttpCode(HttpStatus.CREATED)
  async registrarDoc(
    @Param('idPersona', ParseUUIDPipe) idPersona: string,
    @Body() cuerpo: RegistrarDocumentoSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    const fechaEm = cuerpo.fechaEmision ? new Date(cuerpo.fechaEmision) : null;
    const fechaVenc = cuerpo.fechaVencimiento
      ? new Date(cuerpo.fechaVencimiento)
      : null;
    await this.registrarDocumento.ejecutar({
      personaId: idPersona,
      institucionEducativaId: this.instId(ctx),
      tipoDocumentoId: cuerpo.tipoDocumentoId,
      numero: cuerpo.numero,
      codigoPaisEmision: cuerpo.codigoPaisEmision ?? null,
      esPrincipal: cuerpo.esPrincipal ?? false,
      fechaEmision: fechaEm,
      fechaVencimiento: fechaVenc,
    });
  }

  @Permisos('PERSONAS.GESTIONAR_CONTACTOS')
  @Post(':idPersona/contactos')
  @HttpCode(HttpStatus.CREATED)
  async agregarContacto(
    @Param('idPersona', ParseUUIDPipe) idPersona: string,
    @Body() cuerpo: RegistrarContactoSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    await this.registrarContacto.ejecutar({
      personaId: idPersona,
      institucionEducativaId: this.instId(ctx),
      tipo: cuerpo.tipo,
      valor: cuerpo.valor,
      esPrincipal: cuerpo.esPrincipal ?? false,
    });
  }

  @Permisos('PERSONAS.GESTIONAR_DIRECCIONES')
  @Post(':idPersona/direcciones')
  @HttpCode(HttpStatus.CREATED)
  async agregarDireccion(
    @Param('idPersona', ParseUUIDPipe) idPersona: string,
    @Body() cuerpo: RegistrarDireccionSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    await this.registrarDireccion.ejecutar({
      personaId: idPersona,
      institucionEducativaId: this.instId(ctx),
      direccionLinea: cuerpo.direccionLinea,
      referencia: cuerpo.referencia ?? null,
      latitud: cuerpo.latitud ?? null,
      longitud: cuerpo.longitud ?? null,
      ubigeoId: cuerpo.ubigeoId ?? null,
      esPrincipal: cuerpo.esPrincipal ?? false,
    });
  }

  @Permisos('PERSONAS.VINCULAR_USUARIO')
  @Put(':idPersona/vinculo-membresia')
  @HttpCode(HttpStatus.NO_CONTENT)
  async vincular(
    @Param('idPersona', ParseUUIDPipe) idPersona: string,
    @Body() cuerpo: VincularMembresiaSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    await this.vincularMembresia.vincular({
      personaId: idPersona,
      membresiaId: cuerpo.membresiaId,
      institucionEducativaId: this.instId(ctx),
    });
  }

  @Permisos('PERSONAS.VINCULAR_USUARIO')
  @Delete(':idPersona/vinculo-membresia')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desvincular(
    @Param('idPersona', ParseUUIDPipe) idPersona: string,
    @Body() cuerpo: VincularMembresiaSolicitud,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<void> {
    await this.vincularMembresia.desvincular({
      personaId: idPersona,
      membresiaId: cuerpo.membresiaId,
      institucionEducativaId: this.instId(ctx),
    });
  }
}
