import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Persona } from '../../../../dominio/personas/persona';
import {
  DireccionPersonaTypeormEntidad,
  DocumentoIdentidadPersonaTypeormEntidad,
  MedioContactoPersonaTypeormEntidad,
  PersonaTypeormEntidad,
} from '../entidades/personas.typeorm-entidades';
import {
  RepositorioDireccionesPersona,
  RepositorioDocumentosIdentidadPersona,
  RepositorioMediosContactoPersona,
  RepositorioPersonas,
  RepositorioVinculosPersonaMembresia,
} from '../../../../dominio/puertos/repositorios';

@Injectable()
export class PersonasTypeormRepositorio implements RepositorioPersonas {
  constructor(
    @InjectRepository(PersonaTypeormEntidad)
    private readonly repositorio: Repository<PersonaTypeormEntidad>,
  ) {}

  async crear(persona: Persona): Promise<Persona> {
    await this.repositorio.save({
      id: persona.id,
      institucionEducativaId: persona.institucionEducativaId,
      nombres: persona.nombres,
      apellidoPaterno: persona.apellidoPaterno,
      apellidoMaterno: persona.apellidoMaterno,
      fechaNacimiento: persona.fechaNacimiento,
      sexoRegistral: persona.sexoRegistral,
      codigoPaisNacionalidad: persona.codigoPaisNacionalidad,
      estado: persona.estado,
      fechaCreacion: persona.fechaCreacion,
      fechaModificacion: persona.fechaModificacion,
    });
    return persona;
  }

  async buscarPorId(id: string): Promise<Persona | null> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    return entidad ? this.mapear(entidad) : null;
  }

  async buscarPorIdEnInstitucion(
    id: string,
    institucionEducativaId: string,
  ): Promise<Persona | null> {
    const entidad = await this.repositorio.findOne({
      where: { id, institucionEducativaId },
    });
    return entidad ? this.mapear(entidad) : null;
  }

  async listarPorInstitucion(
    institucionEducativaId: string,
    filtro: { texto?: string; estado?: string; pagina: number; tamano: number },
  ): Promise<{ datos: Persona[]; total: number }> {
    const qb = this.repositorio
      .createQueryBuilder('p')
      .where('p.institucionEducativaId = :inst', {
        inst: institucionEducativaId,
      });

    if (filtro.estado) {
      qb.andWhere('p.estado = :estado', { estado: filtro.estado });
    }
    if (filtro.texto) {
      qb.andWhere(
        '(unaccent(lower(p.nombres)) LIKE unaccent(lower(:texto))' +
          ' OR unaccent(lower(p.apellidoPaterno)) LIKE unaccent(lower(:texto))' +
          ' OR unaccent(lower(p.apellidoMaterno)) LIKE unaccent(lower(:texto)))',
        { texto: `%${filtro.texto}%` },
      );
    }

    const [datos, total] = await qb
      .orderBy('p.fechaCreacion', 'DESC')
      .skip((filtro.pagina - 1) * filtro.tamano)
      .take(filtro.tamano)
      .getManyAndCount();

    return { datos: datos.map((e) => this.mapear(e)), total };
  }

  private mapear(entidad: PersonaTypeormEntidad): Persona {
    return new Persona(
      entidad.id,
      entidad.institucionEducativaId,
      entidad.nombres,
      entidad.apellidoPaterno,
      entidad.apellidoMaterno,
      entidad.fechaNacimiento,
      entidad.sexoRegistral,
      entidad.codigoPaisNacionalidad,
      entidad.estado as 'ACTIVA' | 'INACTIVA' | 'BAJA',
      entidad.fechaCreacion,
      entidad.fechaModificacion,
    );
  }
}

@Injectable()
export class DocumentosIdentidadTypeormRepositorio implements RepositorioDocumentosIdentidadPersona {
  constructor(
    @InjectRepository(DocumentoIdentidadPersonaTypeormEntidad)
    private readonly repositorio: Repository<DocumentoIdentidadPersonaTypeormEntidad>,
  ) {}

  async registrar(entrada: {
    personaId: string;
    institucionEducativaId: string;
    tipoDocumentoId: string;
    numero: string;
    numeroNormalizado: string;
    codigoPaisEmision?: string | null;
    esPrincipal?: boolean;
    fechaEmision?: Date | null;
    fechaVencimiento?: Date | null;
  }): Promise<void> {
    await this.repositorio.save({
      id: randomUUID(),
      personaId: entrada.personaId,
      institucionEducativaId: entrada.institucionEducativaId,
      tipoDocumentoId: entrada.tipoDocumentoId,
      numero: entrada.numero,
      numeroNormalizado: entrada.numeroNormalizado,
      codigoPaisEmision: entrada.codigoPaisEmision ?? null,
      esPrincipal: entrada.esPrincipal ?? false,
      fechaEmision: entrada.fechaEmision ?? null,
      fechaVencimiento: entrada.fechaVencimiento ?? null,
      estado: 'ACTIVO',
    });
  }
}

@Injectable()
export class MediosContactoTypeormRepositorio implements RepositorioMediosContactoPersona {
  constructor(
    @InjectRepository(MedioContactoPersonaTypeormEntidad)
    private readonly repositorio: Repository<MedioContactoPersonaTypeormEntidad>,
  ) {}

  async registrar(entrada: {
    personaId: string;
    institucionEducativaId: string;
    tipo: string;
    valor: string;
    valorNormalizado: string;
    esPrincipal?: boolean;
  }): Promise<void> {
    await this.repositorio.save({
      id: randomUUID(),
      personaId: entrada.personaId,
      institucionEducativaId: entrada.institucionEducativaId,
      tipo: entrada.tipo,
      valor: entrada.valor,
      valorNormalizado: entrada.valorNormalizado,
      esPrincipal: entrada.esPrincipal ?? false,
      verificado: false,
      estado: 'ACTIVO',
    });
  }
}

@Injectable()
export class DireccionesPersonaTypeormRepositorio implements RepositorioDireccionesPersona {
  constructor(
    @InjectRepository(DireccionPersonaTypeormEntidad)
    private readonly repositorio: Repository<DireccionPersonaTypeormEntidad>,
  ) {}

  async registrar(entrada: {
    personaId: string;
    institucionEducativaId: string;
    direccionLinea: string;
    referencia: string | null;
    latitud?: number | null;
    longitud?: number | null;
    ubigeoId?: string | null;
    esPrincipal?: boolean;
  }): Promise<void> {
    await this.repositorio.save({
      id: randomUUID(),
      personaId: entrada.personaId,
      institucionEducativaId: entrada.institucionEducativaId,
      ubigeoId: entrada.ubigeoId ?? null,
      direccionLinea: entrada.direccionLinea,
      referencia: entrada.referencia,
      latitud: entrada.latitud != null ? String(entrada.latitud) : null,
      longitud: entrada.longitud != null ? String(entrada.longitud) : null,
      esPrincipal: entrada.esPrincipal ?? false,
      estado: 'ACTIVA',
    });
  }
}

@Injectable()
export class VinculosPersonaMembresiaTypeormRepositorio implements RepositorioVinculosPersonaMembresia {
  constructor(
    @InjectRepository(PersonaTypeormEntidad)
    private readonly repositorio: Repository<PersonaTypeormEntidad>,
  ) {}

  async vincular(entrada: {
    personaId: string;
    membresiaId: string;
  }): Promise<void> {
    await this.repositorio.manager.query(
      `UPDATE membresias_institucion SET id_persona = $1 WHERE id = $2`,
      [entrada.personaId, entrada.membresiaId],
    );
  }

  async desvincular(entrada: {
    personaId: string;
    membresiaId: string;
  }): Promise<void> {
    await this.repositorio.manager.query(
      `UPDATE membresias_institucion SET id_persona = NULL
       WHERE id = $1 AND id_persona = $2`,
      [entrada.membresiaId, entrada.personaId],
    );
  }
}
