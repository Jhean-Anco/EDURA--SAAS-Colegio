import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return entidad
      ? new Persona(
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
        )
      : null;
  }

  async listarPorInstitucion(
    institucionEducativaId: string,
    filtro: { texto?: string; estado?: string; pagina: number; tamano: number },
  ): Promise<{ datos: Persona[]; total: number }> {
    const [datos, total] = await this.repositorio.findAndCount({
      where: {
        institucionEducativaId,
        ...(filtro.estado ? { estado: filtro.estado } : {}),
      },
      skip: (filtro.pagina - 1) * filtro.tamano,
      take: filtro.tamano,
      order: { fechaCreacion: 'DESC' },
    });
    return {
      datos: datos.map(
        (entidad) =>
          new Persona(
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
          ),
      ),
      total,
    };
  }
}

@Injectable()
export class DocumentosIdentidadTypeormRepositorio implements RepositorioDocumentosIdentidadPersona {
  constructor(
    @InjectRepository(DocumentoIdentidadPersonaTypeormEntidad)
    private readonly repositorio: Repository<DocumentoIdentidadPersonaTypeormEntidad>,
  ) {}
  registrar(): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class MediosContactoTypeormRepositorio implements RepositorioMediosContactoPersona {
  constructor(
    @InjectRepository(MedioContactoPersonaTypeormEntidad)
    private readonly repositorio: Repository<MedioContactoPersonaTypeormEntidad>,
  ) {}
  registrar(): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class DireccionesPersonaTypeormRepositorio implements RepositorioDireccionesPersona {
  constructor(
    @InjectRepository(DireccionPersonaTypeormEntidad)
    private readonly repositorio: Repository<DireccionPersonaTypeormEntidad>,
  ) {}
  registrar(): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class VinculosPersonaMembresiaTypeormRepositorio implements RepositorioVinculosPersonaMembresia {
  vincular(): Promise<void> {
    return Promise.resolve();
  }
  desvincular(): Promise<void> {
    return Promise.resolve();
  }
}
