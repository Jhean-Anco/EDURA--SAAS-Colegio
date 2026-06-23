import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RepositorioPuntosAcceso } from '../../dominio/puertos/repositorios';
import { PuntoAccesoInstitucionTypeormEntidad } from '../../infraestructura/persistencia/typeorm/entidades/identidad-visual.typeorm-entidades';

export interface CrearPuntoAccesoDto {
  tipo: 'SUBDOMINIO_EDURA' | 'RUTA_SLUG' | 'CODIGO_ACCESO' | 'DOMINIO_PERSONALIZADO';
  valor: string;
  esPrincipal: boolean;
}

export interface ActualizarPuntoAccesoDto {
  valor: string;
  esPrincipal: boolean;
}

@Injectable()
export class ListarPuntosAccesoConsulta {
  constructor(
    @Inject('REPOSITORIO_PUNTOS_ACCESO')
    private readonly repo: RepositorioPuntosAcceso,
  ) {}

  async ejecutar(institucionId: string) {
    return this.repo.buscarPorInstitucion(institucionId);
  }
}

@Injectable()
export class CrearPuntoAccesoCasoUso {
  constructor(
    private readonly dataSource: DataSource,
    @Inject('REPOSITORIO_PUNTOS_ACCESO')
    private readonly repo: RepositorioPuntosAcceso,
  ) {}

  async ejecutar(institucionId: string, dto: CrearPuntoAccesoDto) {
    const valorNormalizado = dto.valor.toLowerCase().trim();

    // Validar formato del valor del punto de acceso
    if (dto.tipo === 'RUTA_SLUG' || dto.tipo === 'SUBDOMINIO_EDURA') {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(valorNormalizado)) {
        throw new BadRequestException('El valor debe contener solo letras minúsculas, números y guiones.');
      }
    }

    // Bloquear palabras reservadas
    const palabrasReservadas = ['www', 'api', 'admin', 'plataforma', 'soporte', 'correo', 'static'];
    if (palabrasReservadas.includes(valorNormalizado)) {
      throw new BadRequestException('El valor ingresado está reservado por el sistema.');
    }

    // Verificar si el punto de acceso ya existe en el sistema
    const existente = await this.repo.buscarPorTipoYValor(dto.tipo, valorNormalizado);
    if (existente) {
      throw new BadRequestException('El punto de acceso ya está registrado.');
    }

    let punto!: PuntoAccesoInstitucionTypeormEntidad;
    await this.dataSource.transaction(async (manager) => {
      // Si se define como principal, quitamos el principal de otros del mismo tipo de esta institución
      if (dto.esPrincipal) {
        await manager.query(
          `UPDATE puntos_acceso_institucion
           SET es_principal = FALSE
           WHERE id_institucion_educativa = $1 AND tipo = $2`,
          [institucionId, dto.tipo],
        );
      }

      punto = new PuntoAccesoInstitucionTypeormEntidad();
      punto.idInstitucionEducativa = institucionId;
      punto.tipo = dto.tipo;
      punto.valor = dto.valor;
      punto.valorNormalizado = valorNormalizado;
      punto.esPrincipal = dto.esPrincipal;

      // El dominio personalizado inicia PENDIENTE para verificación. Los demás inician ACTIVO.
      punto.estado = dto.tipo === 'DOMINIO_PERSONALIZADO' ? 'PENDIENTE' : 'ACTIVO';

      await manager.save(PuntoAccesoInstitucionTypeormEntidad, punto);
    });

    return punto;
  }
}

@Injectable()
export class ActualizarPuntoAccesoCasoUso {
  constructor(
    private readonly dataSource: DataSource,
    @Inject('REPOSITORIO_PUNTOS_ACCESO')
    private readonly repo: RepositorioPuntosAcceso,
  ) {}

  async ejecutar(institucionId: string, id: string, dto: ActualizarPuntoAccesoDto) {
    const puntos = await this.repo.buscarPorInstitucion(institucionId);
    const punto = puntos.find((p) => p.id === id);

    if (!punto) {
      throw new NotFoundException('Punto de acceso no encontrado.');
    }

    const valorNormalizado = dto.valor.toLowerCase().trim();

    // Validaciones
    if (punto.tipo === 'RUTA_SLUG' || punto.tipo === 'SUBDOMINIO_EDURA') {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(valorNormalizado)) {
        throw new BadRequestException('El valor debe contener solo letras minúsculas, números y guiones.');
      }
    }

    const palabrasReservadas = ['www', 'api', 'admin', 'plataforma', 'soporte', 'correo', 'static'];
    if (palabrasReservadas.includes(valorNormalizado)) {
      throw new BadRequestException('El valor ingresado está reservado por el sistema.');
    }

    // Verificar si el valor ya existe
    if (punto.valorNormalizado !== valorNormalizado) {
      const existente = await this.repo.buscarPorTipoYValor(punto.tipo, valorNormalizado);
      if (existente) {
        throw new BadRequestException('El punto de acceso ya está registrado.');
      }
    }

    await this.dataSource.transaction(async (manager) => {
      if (dto.esPrincipal) {
        await manager.query(
          `UPDATE puntos_acceso_institucion
           SET es_principal = FALSE
           WHERE id_institucion_educativa = $1 AND tipo = $2`,
          [institucionId, punto.tipo],
        );
      }

      punto.valor = dto.valor;
      punto.valorNormalizado = valorNormalizado;
      punto.esPrincipal = dto.esPrincipal;

      await manager.save(PuntoAccesoInstitucionTypeormEntidad, punto);
    });

    return punto;
  }
}

@Injectable()
export class SuspenderPuntoAccesoCasoUso {
  constructor(
    @Inject('REPOSITORIO_PUNTOS_ACCESO')
    private readonly repo: RepositorioPuntosAcceso,
  ) {}

  async ejecutar(institucionId: string, id: string) {
    const puntos = await this.repo.buscarPorInstitucion(institucionId);
    const punto = puntos.find((p) => p.id === id);

    if (!punto) {
      throw new NotFoundException('Punto de acceso no encontrado.');
    }

    punto.estado = 'SUSPENDIDO';
    await this.repo.guardar(punto);
    return { ok: true };
  }
}
