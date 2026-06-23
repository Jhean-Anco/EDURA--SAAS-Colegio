import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  RepositorioIdentidadVisual,
  RepositorioVersionesIdentidad,
} from '../../dominio/puertos/repositorios';
import {
  IdentidadVisualInstitucionTypeormEntidad,
  VersionIdentidadVisualTypeormEntidad,
} from '../../infraestructura/persistencia/typeorm/entidades/identidad-visual.typeorm-entidades';

// DTOs
export interface CrearActualizarBorradorDto {
  nombreMarca: string;
  nombreCortoVisual?: string;
  lema?: string;
  tituloLogin?: string;
  mensajeLogin?: string;
  textoPieLogin?: string;
  colorPrimario: string;
  colorSobrePrimario: string;
  colorSecundario: string;
  colorAcento: string;
  colorFondo: string;
  colorSuperficie: string;
  colorTextoPrincipal: string;
  colorTextoSecundario: string;
  varianteLogin: string;
}

@Injectable()
export class ObtenerIdentidadVisualConsulta {
  constructor(
    @Inject('REPOSITORIO_IDENTIDAD_VISUAL')
    private readonly repo: RepositorioIdentidadVisual,
  ) {}

  async ejecutar(institucionId: string) {
    const identidad = await this.repo.buscarPorInstitucion(institucionId);
    if (!identidad) {
      throw new NotFoundException('Identidad visual no configurada para esta institución.');
    }
    return identidad;
  }
}

@Injectable()
export class ObtenerBorradorIdentidadConsulta {
  constructor(
    @Inject('REPOSITORIO_IDENTIDAD_VISUAL')
    private readonly identidadRepo: RepositorioIdentidadVisual,
    @Inject('REPOSITORIO_VERSIONES_IDENTIDAD')
    private readonly versionesRepo: RepositorioVersionesIdentidad,
  ) {}

  async ejecutar(institucionId: string) {
    let identidad = await this.identidadRepo.buscarPorInstitucion(institucionId);
    if (!identidad) {
      // Autocreación si no existe
      identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.idInstitucionEducativa = institucionId;
      identidad.estado = 'ACTIVA';
      await this.identidadRepo.guardar(identidad);
    }

    let borrador = await this.versionesRepo.buscarBorrador(identidad.id);
    if (!borrador) {
      // Reutiliza la publicada o crea un borrador vacío basado en un fallback
      const publicada = identidad.idVersionPublicada
        ? await this.versionesRepo.buscarPublicada(identidad.id)
        : null;

      borrador = new VersionIdentidadVisualTypeormEntidad();
      borrador.idIdentidadVisual = identidad.id;
      borrador.numeroVersion = await this.versionesRepo.obtenerSiguienteNumeroVersion(identidad.id);
      borrador.estado = 'BORRADOR';
      borrador.nombreMarca = publicada?.nombreMarca || 'Mi Colegio';
      borrador.nombreCortoVisual = publicada?.nombreCortoVisual || null;
      borrador.lema = publicada?.lema || null;
      borrador.tituloLogin = publicada?.tituloLogin || null;
      borrador.mensajeLogin = publicada?.mensajeLogin || null;
      borrador.textoPieLogin = publicada?.textoPieLogin || null;
      borrador.colorPrimario = publicada?.colorPrimario || '#1E3A8A';
      borrador.colorSobrePrimario = publicada?.colorSobrePrimario || '#FFFFFF';
      borrador.colorSecundario = publicada?.colorSecundario || '#D8A72D';
      borrador.colorAcento = publicada?.colorAcento || '#3B82F6';
      borrador.colorFondo = publicada?.colorFondo || '#F8FAFC';
      borrador.colorSuperficie = publicada?.colorSuperficie || '#FFFFFF';
      borrador.colorTextoPrincipal = publicada?.colorTextoPrincipal || '#172033';
      borrador.colorTextoSecundario = publicada?.colorTextoSecundario || '#536078';
      borrador.varianteLogin = publicada?.varianteLogin || 'CENTRAL';
      borrador.idUsuarioCreador = '00000000-0000-0000-0000-000000000000'; // Default o se actualiza al guardar
      await this.versionesRepo.guardar(borrador);
    }

    return borrador;
  }
}

@Injectable()
export class ActualizarBorradorIdentidadCasoUso {
  constructor(
    @Inject('REPOSITORIO_IDENTIDAD_VISUAL')
    private readonly identidadRepo: RepositorioIdentidadVisual,
    @Inject('REPOSITORIO_VERSIONES_IDENTIDAD')
    private readonly versionesRepo: RepositorioVersionesIdentidad,
  ) {}

  async ejecutar(institucionId: string, dto: CrearActualizarBorradorDto, usuarioId: string) {
    let identidad = await this.identidadRepo.buscarPorInstitucion(institucionId);
    if (!identidad) {
      identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.idInstitucionEducativa = institucionId;
      identidad.estado = 'ACTIVA';
      await this.identidadRepo.guardar(identidad);
    }

    let borrador = await this.versionesRepo.buscarBorrador(identidad.id);
    if (!borrador) {
      borrador = new VersionIdentidadVisualTypeormEntidad();
      borrador.idIdentidadVisual = identidad.id;
      borrador.numeroVersion = await this.versionesRepo.obtenerSiguienteNumeroVersion(identidad.id);
      borrador.estado = 'BORRADOR';
    }

    // Validar colores
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    const camposColor = [
      'colorPrimario',
      'colorSobrePrimario',
      'colorSecundario',
      'colorAcento',
      'colorFondo',
      'colorSuperficie',
      'colorTextoPrincipal',
      'colorTextoSecundario',
    ];

    for (const campo of camposColor) {
      const valor = (dto as any)[campo];
      if (!valor || !hexRegex.test(valor)) {
        throw new BadRequestException(`El campo '${campo}' debe ser un color hexadecimal válido de 7 caracteres (ej: #FFFFFF).`);
      }
    }

    borrador.nombreMarca = dto.nombreMarca;
    borrador.nombreCortoVisual = dto.nombreCortoVisual || null;
    borrador.lema = dto.lema || null;
    borrador.tituloLogin = dto.tituloLogin || null;
    borrador.mensajeLogin = dto.mensajeLogin || null;
    borrador.textoPieLogin = dto.textoPieLogin || null;
    borrador.colorPrimario = dto.colorPrimario;
    borrador.colorSobrePrimario = dto.colorSobrePrimario;
    borrador.colorSecundario = dto.colorSecundario;
    borrador.colorAcento = dto.colorAcento;
    borrador.colorFondo = dto.colorFondo;
    borrador.colorSuperficie = dto.colorSuperficie;
    borrador.colorTextoPrincipal = dto.colorTextoPrincipal;
    borrador.colorTextoSecundario = dto.colorTextoSecundario;
    borrador.varianteLogin = dto.varianteLogin;
    borrador.idUsuarioCreador = usuarioId;

    await this.versionesRepo.guardar(borrador);
    return borrador;
  }
}

@Injectable()
export class PublicarIdentidadVisualCasoUso {
  constructor(
    private readonly dataSource: DataSource,
    @Inject('REPOSITORIO_IDENTIDAD_VISUAL')
    private readonly identidadRepo: RepositorioIdentidadVisual,
    @Inject('REPOSITORIO_VERSIONES_IDENTIDAD')
    private readonly versionesRepo: RepositorioVersionesIdentidad,
  ) {}

  async ejecutar(institucionId: string, usuarioId: string) {
    const identidad = await this.identidadRepo.buscarPorInstitucion(institucionId);
    if (!identidad) {
      throw new NotFoundException('No existe configuración de identidad visual para esta institución.');
    }

    const borrador = await this.versionesRepo.buscarBorrador(identidad.id);
    if (!borrador) {
      throw new BadRequestException('No existe ninguna versión borrador editable para publicar.');
    }

    // Publicamos de forma transaccional
    await this.dataSource.transaction(async (manager) => {
      // 1. Archivar la versión publicada anterior (si existe)
      if (identidad.idVersionPublicada) {
        await manager.query(
          `UPDATE versiones_identidad_visual SET estado = 'ARCHIVADA' WHERE id = $1`,
          [identidad.idVersionPublicada],
        );
      }

      // 2. Publicar la versión actual borrador
      borrador.estado = 'PUBLICADA';
      borrador.idUsuarioPublicador = usuarioId;
      borrador.fechaPublicacion = new Date();
      await manager.save(VersionIdentidadVisualTypeormEntidad, borrador);

      // 3. Asociar en identidad
      identidad.idVersionPublicada = borrador.id;
      identidad.estado = 'ACTIVA';
      await manager.save(IdentidadVisualInstitucionTypeormEntidad, identidad);
    });

    return { ok: true, versionPublicada: borrador.numeroVersion };
  }
}

@Injectable()
export class InactivarIdentidadVisualCasoUso {
  constructor(
    @Inject('REPOSITORIO_IDENTIDAD_VISUAL')
    private readonly repo: RepositorioIdentidadVisual,
  ) {}

  async ejecutar(institucionId: string) {
    const identidad = await this.repo.buscarPorInstitucion(institucionId);
    if (!identidad) {
      throw new NotFoundException('Identidad visual no configurada.');
    }

    identidad.estado = 'INACTIVA';
    await this.repo.guardar(identidad);
    return { ok: true };
  }
}
