import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultadorContactosSede } from '../../../../dominio/contactos-sede/consultador-contactos.puerto';
import { ContactoSedeResumen } from '../../../../dominio/contactos-sede/contacto-sede.resumen';
import { CanalContactoSedeTypeormEntidad } from '../entidades/canal-contacto-sede.typeorm-entidad';

@Injectable()
export class ContactoTypeormConsulta implements ConsultadorContactosSede {
  constructor(
    @InjectRepository(CanalContactoSedeTypeormEntidad)
    private readonly repositorio: Repository<CanalContactoSedeTypeormEntidad>,
  ) {}

  async listarPorSede(sedeId: string): Promise<ContactoSedeResumen[]> {
    const entidades = await this.repositorio.find({
      where: { sedeId },
      order: { orden: 'ASC' },
    });
    return entidades.map((entidad) => ({
      id: entidad.id,
      sedeId: entidad.sedeId,
      tipoCanal: entidad.tipoCanal,
      etiqueta: entidad.etiqueta,
      valor: entidad.valor,
      valorNormalizado: entidad.valorNormalizado,
      esPrincipal: entidad.esPrincipal,
      visiblePublicamente: entidad.visiblePublicamente,
      estado: entidad.estado,
      orden: entidad.orden,
    }));
  }
}
