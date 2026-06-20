import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ListarContactosSedeConsulta } from '../../../aplicacion/contactos/listar-contactos-sede.consulta';
import { ContactoRespuesta } from '../respuestas/contacto.respuesta';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/contactos')
export class ContactosControlador {
  constructor(
    private readonly consulta: ListarContactosSedeConsulta,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<ContactoRespuesta[]> {
    const sede = await this.sedes.obtenerActivaPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    validarSedeDelContexto(ctx, sede.institucionId, idSede);
    return this.consulta.ejecutar(idSede);
  }
}
