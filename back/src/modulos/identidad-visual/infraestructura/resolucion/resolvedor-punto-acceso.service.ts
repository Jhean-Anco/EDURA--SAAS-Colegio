import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResolvedorPuntoAccesoInstitucion, ResolvedorAcceso } from '../../dominio/puertos/puertos';
import { RepositorioPuntosAcceso } from '../../dominio/puertos/repositorios';
import { InstitucionEducativaTypeormEntidad } from '../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';

@Injectable()
export class ResolvedorPuntoAccesoInstitucionService implements ResolvedorPuntoAccesoInstitucion {
  constructor(
    @Inject('REPOSITORIO_PUNTOS_ACCESO')
    private readonly puntosRepo: RepositorioPuntosAcceso,
    @InjectRepository(InstitucionEducativaTypeormEntidad)
    private readonly institucionRepo: Repository<InstitucionEducativaTypeormEntidad>,
  ) {}

  async resolver(tipo: string, identificador: string): Promise<ResolvedorAcceso> {
    if (tipo === 'PLATAFORMA') {
      return {
        tipoAcceso: 'PLATAFORMA',
        institucionId: null,
        puntoAccesoId: null,
        identificadorNormalizado: null,
      };
    }

    const valorNormalizado = identificador.toLowerCase().trim();

    // Palabras reservadas para plataforma
    const palabrasReservadas = ['plataforma', 'admin', 'www', 'api', 'soporte', 'correo', 'static'];
    if (palabrasReservadas.includes(valorNormalizado)) {
      return {
        tipoAcceso: 'PLATAFORMA',
        institucionId: null,
        puntoAccesoId: null,
        identificadorNormalizado: null,
      };
    }

    // Buscamos el punto de acceso
    const punto = await this.puntosRepo.buscarPorTipoYValor(tipo, valorNormalizado);
    if (!punto || punto.estado !== 'ACTIVO') {
      return {
        tipoAcceso: 'INSTITUCION',
        institucionId: null,
        puntoAccesoId: null,
        identificadorNormalizado: valorNormalizado,
      };
    }

    // Validamos que la institución exista y esté activa
    const institucion = await this.institucionRepo.findOne({
      where: { id: punto.idInstitucionEducativa },
    });

    if (!institucion || institucion.estado !== 'ACTIVA') {
      return {
        tipoAcceso: 'INSTITUCION',
        institucionId: null,
        puntoAccesoId: punto.id,
        identificadorNormalizado: valorNormalizado,
      };
    }

    return {
      tipoAcceso: 'INSTITUCION',
      institucionId: institucion.id,
      puntoAccesoId: punto.id,
      identificadorNormalizado: valorNormalizado,
    };
  }
}
