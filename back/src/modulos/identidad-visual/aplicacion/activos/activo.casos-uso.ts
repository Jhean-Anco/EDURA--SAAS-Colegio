import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { AlmacenamientoActivosIdentidad } from '../../dominio/puertos/puertos';
import {
  RepositorioActivosIdentidad,
  RepositorioVersionesIdentidad,
} from '../../dominio/puertos/repositorios';
import { ActivoIdentidadVisualTypeormEntidad } from '../../infraestructura/persistencia/typeorm/entidades/identidad-visual.typeorm-entidades';

export interface CargarActivoDto {
  tipo: 'LOGO_PRINCIPAL' | 'LOGO_HORIZONTAL' | 'LOGO_FONDO_CLARO' | 'LOGO_FONDO_OSCURO' | 'ISOTIPO' | 'FAVICON' | 'FONDO_LOGIN' | 'IMAGEN_PORTADA';
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
  buffer: Buffer;
  textoAlternativo: string;
}

@Injectable()
export class CargarActivoIdentidadCasoUso {
  constructor(
    private readonly dataSource: DataSource,
    @Inject('REPOSITORIO_VERSIONES_IDENTIDAD')
    private readonly versionesRepo: RepositorioVersionesIdentidad,
    @Inject('REPOSITORIO_ACTIVOS_IDENTIDAD')
    private readonly activosRepo: RepositorioActivosIdentidad,
    @Inject('ALMACENAMIENTO_ACTIVOS_IDENTIDAD')
    private readonly almacenamiento: AlmacenamientoActivosIdentidad,
  ) {}

  async ejecutar(institucionId: string, dto: CargarActivoDto, usuarioId: string) {
    // 1. Obtener la versión borrador de la institución
    // Buscamos a través de la identidad
    const identidad = await this.dataSource.query(
      `SELECT id FROM identidades_visuales_institucion WHERE id_institucion_educativa = $1`,
      [institucionId],
    );

    if (!identidad || identidad.length === 0) {
      throw new NotFoundException('Identidad visual no configurada.');
    }

    const identidadId = identidad[0].id;
    const borrador = await this.versionesRepo.buscarBorrador(identidadId);
    if (!borrador) {
      throw new BadRequestException('No existe ninguna versión borrador editable para cargar activos.');
    }

    // 2. Validaciones de archivos
    const tiposMimePermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!tiposMimePermitidos.includes(dto.tipoMime)) {
      throw new BadRequestException(`Tipo MIME '${dto.tipoMime}' no permitido. Use PNG, JPEG, WebP o ICO.`);
    }

    // Límites de tamaño
    let limiteMaximo = 2 * 1024 * 1024; // Logos 2 MB
    if (dto.tipo === 'FAVICON') {
      limiteMaximo = 512 * 1024; // Favicon 512 KB
    } else if (dto.tipo === 'FONDO_LOGIN') {
      limiteMaximo = 5 * 1024 * 1024; // Fondo de login 5 MB
    }

    if (dto.tamanoBytes > limiteMaximo) {
      throw new BadRequestException(`El archivo excede el límite de tamaño permitido para ${dto.tipo} (${limiteMaximo / (1024 * 1024)} MB).`);
    }

    // Calculemos el checksum sha256
    const checksum = crypto.createHash('sha256').update(dto.buffer).digest('hex');

    // 3. Subir archivo
    const { claveAlmacenamiento, urlPublica } = await this.almacenamiento.guardar(
      dto.nombreOriginal,
      dto.buffer,
      dto.tipoMime,
    );

    // 4. Guardar y archivar los activos anteriores del mismo tipo en esta versión de forma transaccional
    let nuevoActivo!: ActivoIdentidadVisualTypeormEntidad;
    await this.dataSource.transaction(async (manager) => {
      // Archivar activos activos anteriores de la misma versión y del mismo tipo
      await manager.query(
        `UPDATE activos_identidad_visual
         SET estado = 'ARCHIVADO'
         WHERE id_version_identidad_visual = $1 AND tipo = $2 AND estado = 'ACTIVO'`,
        [borrador.id, dto.tipo],
      );

      nuevoActivo = new ActivoIdentidadVisualTypeormEntidad();
      nuevoActivo.idVersionIdentidadVisual = borrador.id;
      nuevoActivo.tipo = dto.tipo;
      nuevoActivo.claveAlmacenamiento = claveAlmacenamiento;
      nuevoActivo.nombreOriginal = dto.nombreOriginal;
      nuevoActivo.tipoMime = dto.tipoMime;
      nuevoActivo.tamanoBytes = dto.tamanoBytes.toString();
      nuevoActivo.checksumSha256 = checksum;
      nuevoActivo.textoAlternativo = dto.textoAlternativo;
      nuevoActivo.estado = 'ACTIVO';
      nuevoActivo.idUsuarioCarga = usuarioId;

      await manager.save(ActivoIdentidadVisualTypeormEntidad, nuevoActivo);
    });

    return {
      id: nuevoActivo.id,
      tipo: nuevoActivo.tipo,
      url: urlPublica,
      textoAlternativo: nuevoActivo.textoAlternativo,
    };
  }
}

@Injectable()
export class ArchivarActivoIdentidadCasoUso {
  constructor(
    @Inject('REPOSITORIO_ACTIVOS_IDENTIDAD')
    private readonly repo: RepositorioActivosIdentidad,
  ) {}

  async ejecutar(activoId: string) {
    const activo = await this.repo.buscarPorId(activoId);
    if (!activo) {
      throw new NotFoundException('Activo no encontrado.');
    }

    activo.estado = 'ARCHIVADO';
    await this.repo.guardar(activo);
    return { ok: true };
  }
}
