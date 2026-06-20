import { Controller, Get, Param } from '@nestjs/common';
import { ListarContactosSedeConsulta } from '../../../aplicacion/contactos/listar-contactos-sede.consulta';
import { ContactoRespuesta } from '../respuestas/contacto.respuesta';

@Controller('sedes/:idSede/contactos')
export class ContactosControlador {
  constructor(private readonly consulta: ListarContactosSedeConsulta) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<ContactoRespuesta[]> {
    return this.consulta.ejecutar(idSede);
  }
}
