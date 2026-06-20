import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CrearPersonaCasoUso } from '../../../aplicacion/personas/crear-persona.caso-uso';
import { ListarPersonasConsulta } from '../../../aplicacion/personas/listar-personas.consulta';
import { ObtenerPersonaConsulta } from '../../../aplicacion/personas/obtener-persona.consulta';
import { CrearPersonaSolicitud } from '../solicitudes/crear-persona.solicitud';

@Controller('personas')
export class PersonasControlador {
  constructor(
    private readonly crearPersona: CrearPersonaCasoUso,
    private readonly obtenerPersona: ObtenerPersonaConsulta,
    private readonly listarPersonas: ListarPersonasConsulta,
  ) {}

  @Post()
  crear(@Body() entrada: CrearPersonaSolicitud) {
    return this.crearPersona.ejecutar(entrada);
  }

  @Get()
  listar(
    @Query('institucionEducativaId') institucionEducativaId: string,
    @Query('pagina') pagina = '1',
    @Query('tamano') tamano = '20',
  ) {
    return this.listarPersonas.ejecutar(institucionEducativaId, {
      pagina: Number(pagina),
      tamano: Number(tamano),
    });
  }

  @Get(':idPersona')
  obtener(@Param('idPersona', ParseUUIDPipe) idPersona: string) {
    return this.obtenerPersona.ejecutar(idPersona);
  }
}
