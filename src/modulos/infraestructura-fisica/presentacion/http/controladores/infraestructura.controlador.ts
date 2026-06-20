import { Controller, Get, Param } from '@nestjs/common';
import { ListarElementosInfraestructuraConsulta } from '../../../aplicacion/consultas/listar-elementos-infraestructura.consulta';
import { ElementosInfraestructuraListadoRespuesta } from '../respuestas/elementos-infraestructura-listado.respuesta';
import { ElementoInfraestructuraTypeormEntidad } from '../../../infraestructura/persistencia/typeorm/entidades/elemento-infraestructura.typeorm-entidad';

@Controller('sedes/:idSede/infraestructura')
export class InfraestructuraControlador {
  constructor(
    private readonly listarElementos: ListarElementosInfraestructuraConsulta,
  ) {}

  @Get('elementos')
  async listar(
    @Param('idSede') idSede: string,
  ): Promise<ElementosInfraestructuraListadoRespuesta> {
    const datos: ElementoInfraestructuraTypeormEntidad[] =
      await this.listarElementos.ejecutar(idSede);
    return {
      datos: datos.map((elemento: ElementoInfraestructuraTypeormEntidad) => ({
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
