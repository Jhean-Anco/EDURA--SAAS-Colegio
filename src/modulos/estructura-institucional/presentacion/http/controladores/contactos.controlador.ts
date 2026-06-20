import { Controller, Get, Param } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ListarContactosSedeConsulta } from '../../../aplicacion/contactos/listar-contactos-sede.consulta';
import { ContactoRespuesta } from '../respuestas/contacto.respuesta';

@Controller('sedes/:idSede/contactos')
export class ContactosControlador {
  constructor(private readonly consulta: ListarContactosSedeConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(@Param('idSede') idSede: string): Promise<ContactoRespuesta[]> {
    return this.consulta.ejecutar(idSede);
  }
}
