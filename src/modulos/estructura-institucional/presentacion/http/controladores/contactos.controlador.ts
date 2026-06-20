import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ListarContactosSedeConsulta } from '../../../aplicacion/contactos/listar-contactos-sede.consulta';
import { ContactoRespuesta } from '../respuestas/contacto.respuesta';
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
  async listar(@Param('idSede') idSede: string): Promise<ContactoRespuesta[]> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    return this.consulta.ejecutar(idSede);
  }
}
