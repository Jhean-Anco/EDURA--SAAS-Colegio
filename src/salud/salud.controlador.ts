import { Controller, Get } from '@nestjs/common';
import { Publico } from '../compartido/presentacion/http/decoradores/publico.decorador';
import { IndicadorBaseDatos } from './indicadores/indicador-base-datos.service';

@Controller('salud')
export class HealthController {
  constructor(private readonly indicadorBaseDatos: IndicadorBaseDatos) {}

  @Publico()
  @Get()
  async obtenerSalud(): Promise<{
    estado: string;
    baseDatos: string;
    fecha: string;
  }> {
    const baseDatos = await this.indicadorBaseDatos.verificar();
    return {
      estado: 'disponible',
      baseDatos: baseDatos ? 'disponible' : 'no_disponible',
      fecha: new Date().toISOString(),
    };
  }
}
