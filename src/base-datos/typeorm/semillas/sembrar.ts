import { DataSource, EntityManager } from 'typeorm';
import fuenteDatos from '../fuente-datos';
import { catalogos } from './catalogos';

async function upsertCatalogo(
  manager: EntityManager,
  tabla: string,
  columnas: readonly string[],
  registros: readonly Record<string, unknown>[],
): Promise<void> {
  for (const registro of registros) {
    const valores = columnas.map((columna) => registro[columna] ?? null);
    const placeholders = valores
      .map((_, indice) => `$${indice + 1}`)
      .join(', ');
    const actualizaciones = columnas
      .filter((columna) => columna !== 'codigo')
      .map((columna) => `${columna} = EXCLUDED.${columna}`)
      .join(', ');
    await manager.query(
      `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${placeholders}) ON CONFLICT (codigo) DO UPDATE SET ${actualizaciones}`,
      valores,
    );
  }
}

export async function ejecutarSemilla(
  dataSource: DataSource = fuenteDatos,
): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  await dataSource.transaction(async (manager) => {
    await upsertCatalogo(
      manager,
      'estados_conservacion',
      ['codigo', 'nombre', 'orden', 'activo'],
      catalogos.estadosConservacion,
    );
    await upsertCatalogo(
      manager,
      'tipos_componente_infraestructura',
      ['codigo', 'nombre', 'categoria', 'activo'],
      catalogos.tiposComponenteInfraestructura,
    );
    await upsertCatalogo(
      manager,
      'unidades_medida',
      ['codigo', 'nombre', 'simbolo', 'magnitud', 'activo'],
      catalogos.unidadesMedida,
    );
    await upsertCatalogo(
      manager,
      'tipos_espacio_fisico',
      ['codigo', 'nombre', 'descripcion', 'activo', 'requiere_aforo'],
      catalogos.tiposEspacioFisico,
    );
  });

  if (dataSource === fuenteDatos) {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  ejecutarSemilla().catch(async (error) => {
    if (fuenteDatos.isInitialized) {
      await fuenteDatos.destroy().catch(() => undefined);
    }
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
