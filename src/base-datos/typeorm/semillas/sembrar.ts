import { DataSource } from 'typeorm';
import fuenteDatos from '../fuente-datos';
import { catalogos } from './catalogos';

async function sembrarTabla(
  dataSource: DataSource,
  tabla: string,
  codigos: readonly string[],
  extras: Record<string, unknown> = {},
): Promise<void> {
  for (const codigo of codigos) {
    await dataSource
      .query(
        `INSERT INTO ${tabla} (codigo, nombre, descripcion, activo, categoria, orden, requiere_aforo) VALUES ($1,$2,$3,true,$4,$5,$6) ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, activo = EXCLUDED.activo`,
        [
          codigo,
          codigo.replaceAll('_', ' '),
          `Catálogo local de desarrollo: ${codigo}`,
          extras.categoria ?? null,
          extras.orden ?? 0,
          extras.requiereAforo ?? true,
        ],
      )
      .catch(async () => {
        await dataSource.query(
          `INSERT INTO ${tabla} (codigo, nombre, descripcion, activo) VALUES ($1,$2,$3,true) ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, activo = EXCLUDED.activo`,
          [
            codigo,
            codigo.replaceAll('_', ' '),
            `Catálogo local de desarrollo: ${codigo}`,
          ],
        );
      });
  }
}

export async function ejecutarSemilla(): Promise<void> {
  await fuenteDatos.initialize();
  await fuenteDatos.transaction(async (manager) => {
    await sembrarTabla(
      manager.connection,
      'tipos_servicio_basico',
      catalogos.tiposServicioBasico,
    );
    await sembrarTabla(
      manager.connection,
      'tipos_elemento_infraestructura',
      catalogos.tiposElementoInfraestructura,
    );
    await sembrarTabla(
      manager.connection,
      'estados_conservacion',
      catalogos.estadosConservacion,
      { orden: 1 },
    );
    await sembrarTabla(
      manager.connection,
      'tipos_tenencia_predio',
      catalogos.tiposTenenciaPredio,
    );
    await sembrarTabla(
      manager.connection,
      'tipos_edificacion',
      catalogos.tiposEdificacion,
    );
    await sembrarTabla(
      manager.connection,
      'tipos_espacio_fisico',
      catalogos.tiposEspacioFisico,
      { requiereAforo: true },
    );
    await sembrarTabla(
      manager.connection,
      'tipos_espacio_exterior',
      catalogos.tiposEspacioExterior,
    );
    await sembrarTabla(
      manager.connection,
      'tipos_componente_infraestructura',
      catalogos.tiposComponenteInfraestructura,
      { categoria: 'GENERAL' },
    );
    await sembrarTabla(
      manager.connection,
      'unidades_medida',
      catalogos.unidadesMedida,
    );
  });
  await fuenteDatos.destroy();
}

if (require.main === module) {
  ejecutarSemilla().catch(async (error) => {
    await fuenteDatos.destroy().catch(() => undefined);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
