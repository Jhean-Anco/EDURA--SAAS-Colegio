import { Controller, Get, Param } from '@nestjs/common';
import { ListarElementosInfraestructuraConsulta } from '../../../aplicacion/consultas/listar-elementos-infraestructura.consulta';
import { ElementosInfraestructuraListadoRespuesta } from '../respuestas/elementos-infraestructura-listado.respuesta';

@Controller('sedes/:idSede/infraestructura')
export class InfraestructuraControlador {
  constructor(
    private readonly listarElementos: ListarElementosInfraestructuraConsulta,
  ) {}

  @Get('elementos')
  async listar(
    @Param('idSede') idSede: string,
  ): Promise<ElementosInfraestructuraListadoRespuesta> {
    const datos = await this.listarElementos.ejecutar(idSede);
    return {
      datos: datos.map((elemento) => ({
        id: elemento.id,
        sedeId: elemento.sedeId,
        tipoElementoId: elemento.tipoElementoId,
        codigo: elemento.codigo,
        nombre: elemento.nombre,
        estado: elemento.estado,
        orden: elemento.orden,
      })),
    };
  }
}
