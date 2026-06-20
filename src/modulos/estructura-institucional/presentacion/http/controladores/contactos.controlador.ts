import { Controller, Get, Param } from '@nestjs/common';
import { ContactoTypeormConsulta } from '../../../infraestructura/persistencia/typeorm/repositorios/contacto.typeorm-consulta';
import { ContactoRespuesta } from '../respuestas/contacto.respuesta';

@Controller('sedes/:idSede/contactos')
export class ContactosControlador {
  constructor(private readonly consulta: ContactoTypeormConsulta) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<ContactoRespuesta[]> {
    return this.consulta.listarPorSede(idSede);
  }
}
