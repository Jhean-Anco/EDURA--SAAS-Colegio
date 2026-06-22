import { DataSource, EntityManager } from 'typeorm';
import fuenteDatos from '../fuente-datos';
import { catalogos } from './catalogos';
import { tiposDocumentoIdentidad } from './tipos-documento';
import {
  permisosSistema,
  rolesSistema,
  permisosAdministradorInstitucion,
  permisosDirectorSede,
  permisosDocente,
  permisosEstudiante,
  permisosApoderado,
} from './permisos-roles';

async function upsertPorCodigo(
  manager: EntityManager,
  tabla: string,
  columnas: readonly string[],
  registros: readonly Record<string, unknown>[],
): Promise<void> {
  for (const registro of registros) {
    const valores = columnas.map((c) => registro[c] ?? null);
    const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
    const actualizaciones = columnas
      .filter((c) => c !== 'codigo')
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(', ');
    await manager.query(
      `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (codigo) DO UPDATE SET ${actualizaciones}`,
      valores,
    );
  }
}

async function sembrarCatalogos(manager: EntityManager): Promise<void> {
  await upsertPorCodigo(
    manager,
    'estados_conservacion',
    ['codigo', 'nombre', 'orden', 'activo'],
    catalogos.estadosConservacion,
  );
  await upsertPorCodigo(
    manager,
    'tipos_componente_infraestructura',
    ['codigo', 'nombre', 'categoria', 'activo'],
    catalogos.tiposComponenteInfraestructura,
  );
  await upsertPorCodigo(
    manager,
    'unidades_medida',
    ['codigo', 'nombre', 'simbolo', 'magnitud', 'activo'],
    catalogos.unidadesMedida,
  );
  await upsertPorCodigo(
    manager,
    'tipos_espacio_fisico',
    ['codigo', 'nombre', 'descripcion', 'activo', 'requiere_aforo'],
    catalogos.tiposEspacioFisico,
  );
  await upsertPorCodigo(
    manager,
    'tipos_documento_identidad',
    [
      'codigo',
      'nombre',
      'longitud_minima',
      'longitud_maxima',
      'patron',
      'activo',
    ],
    tiposDocumentoIdentidad,
  );
}

async function sembrarPermisosYRoles(manager: EntityManager): Promise<void> {
  for (const permiso of permisosSistema) {
    await manager.query(
      `INSERT INTO permisos (codigo, recurso, accion, descripcion, activo)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (codigo) DO UPDATE
         SET recurso = EXCLUDED.recurso,
             accion = EXCLUDED.accion,
             descripcion = EXCLUDED.descripcion,
             activo = true`,
      [permiso.codigo, permiso.recurso, permiso.accion, permiso.descripcion],
    );
  }

  for (const rol of rolesSistema) {
    await manager.query(
      `INSERT INTO roles (codigo, nombre, descripcion, ambito, es_sistema, activo)
       VALUES ($1, $2, $3, $4, true, true)
       ON CONFLICT (codigo) DO UPDATE
         SET nombre = EXCLUDED.nombre,
             descripcion = EXCLUDED.descripcion,
             ambito = EXCLUDED.ambito,
             activo = true`,
      [rol.codigo, rol.nombre, rol.descripcion, rol.ambito],
    );
  }

  await asignarPermisos(
    manager,
    'ADMINISTRADOR_INSTITUCION',
    permisosAdministradorInstitucion,
  );
  await asignarPermisos(manager, 'DIRECTOR_SEDE', permisosDirectorSede);
  await asignarPermisos(manager, 'DOCENTE', permisosDocente);
  await asignarPermisos(manager, 'ESTUDIANTE', permisosEstudiante);
  await asignarPermisos(manager, 'APODERADO', permisosApoderado);

  const permisosOwner = permisosSistema.map((p) => p.codigo);
  await asignarPermisos(manager, 'PROPIETARIO_PLATAFORMA', permisosOwner);
}

async function asignarPermisos(
  manager: EntityManager,
  codigoRol: string,
  codigosPermisos: readonly string[],
): Promise<void> {
  if (codigosPermisos.length > 0) {
    await manager.query(
      `DELETE FROM roles_permisos
       WHERE id_rol = (SELECT id FROM roles WHERE codigo = $1)
         AND id_permiso NOT IN (
           SELECT id FROM permisos WHERE codigo = ANY($2)
         )`,
      [codigoRol, codigosPermisos as string[]],
    );
  } else {
    await manager.query(
      `DELETE FROM roles_permisos
       WHERE id_rol = (SELECT id FROM roles WHERE codigo = $1)`,
      [codigoRol],
    );
  }

  for (const codigoPermiso of codigosPermisos) {
    await manager.query(
      `INSERT INTO roles_permisos (id_rol, id_permiso)
       SELECT r.id, p.id
       FROM roles r, permisos p
       WHERE r.codigo = $1 AND p.codigo = $2
       ON CONFLICT DO NOTHING`,
      [codigoRol, codigoPermiso],
    );
  }
}

export async function ejecutarSemilla(
  dataSource: DataSource = fuenteDatos,
  modo?: 'catalogos' | 'seguridad',
): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  await dataSource.transaction(async (manager) => {
    if (!modo || modo === 'catalogos') {
      await sembrarCatalogos(manager);
    }
    if (!modo || modo === 'seguridad') {
      await sembrarPermisosYRoles(manager);
    }
  });

  if (dataSource === fuenteDatos) {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  const modo = process.argv[2] as 'catalogos' | 'seguridad' | undefined;
  ejecutarSemilla(fuenteDatos, modo).catch(async (error) => {
    if (fuenteDatos.isInitialized) {
      await fuenteDatos.destroy().catch(() => undefined);
    }
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
