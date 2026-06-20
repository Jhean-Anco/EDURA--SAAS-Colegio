import { Controller, Get, Param } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { ListarContactosSedeConsulta } from '../../../aplicacion/contactos/listar-contactos-sede.consulta';
import { ContactoRespuesta } from '../respuestas/contacto.respuesta';

@Controller('sedes/:idSede/contactos')
export class ContactosControlador {
  constructor(private readonly consulta: ListarContactosSedeConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<ContactoRespuesta[]> {
    validarSedeDelContexto(ctx, ctx?.institucionId ?? '', idSede);
    return this.consulta.ejecutar(idSede);
  }
}
