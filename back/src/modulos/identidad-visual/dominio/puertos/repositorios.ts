import {
  IdentidadVisualInstitucionTypeormEntidad,
  VersionIdentidadVisualTypeormEntidad,
  ActivoIdentidadVisualTypeormEntidad,
  PuntoAccesoInstitucionTypeormEntidad,
} from '../../infraestructura/persistencia/typeorm/entidades/identidad-visual.typeorm-entidades';

export interface RepositorioIdentidadVisual {
  buscarPorInstitucion(institucionId: string): Promise<IdentidadVisualInstitucionTypeormEntidad | null>;
  guardar(identidad: IdentidadVisualInstitucionTypeormEntidad): Promise<void>;
}

export interface RepositorioVersionesIdentidad {
  buscarPorId(id: string): Promise<VersionIdentidadVisualTypeormEntidad | null>;
  buscarBorrador(identidadId: string): Promise<VersionIdentidadVisualTypeormEntidad | null>;
  buscarPublicada(identidadId: string): Promise<VersionIdentidadVisualTypeormEntidad | null>;
  guardar(version: VersionIdentidadVisualTypeormEntidad): Promise<void>;
  obtenerSiguienteNumeroVersion(identidadId: string): Promise<number>;
}

export interface RepositorioActivosIdentidad {
  buscarPorId(id: string): Promise<ActivoIdentidadVisualTypeormEntidad | null>;
  buscarActivoPorTipo(versionId: string, tipo: string): Promise<ActivoIdentidadVisualTypeormEntidad | null>;
  guardar(activo: ActivoIdentidadVisualTypeormEntidad): Promise<void>;
}

export interface RepositorioPuntosAcceso {
  buscarPorInstitucion(institucionId: string): Promise<PuntoAccesoInstitucionTypeormEntidad[]>;
  buscarPorTipoYValor(tipo: string, valor: string): Promise<PuntoAccesoInstitucionTypeormEntidad | null>;
  guardar(punto: PuntoAccesoInstitucionTypeormEntidad): Promise<void>;
}
