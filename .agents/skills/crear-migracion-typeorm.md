---
id: crear-migracion-typeorm
version: "1.0.0"
descripcion: "Genera migración TypeORM y valida que no sea destructiva sin confirmación"
categoria: base-datos
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nueva entidad TypeORM
  - nueva columna en entidad existente
  - nueva FK o índice
  - cambio de tipo de columna
no_activar_cuando:
  - cambio solo en lógica de aplicación sin impacto en esquema
herramientas_permitidas: [lectura, ejecucion_migration_generate, ejecucion_migration_show]
presupuesto: normal
---

## Pasos

1. Verificar que la entidad esté registrada en `fuente-datos.ts`.
2. Ejecutar:
   ```bash
   npm --prefix back run db:migration:generate --name=<NombreDescriptivo>
   ```
3. Leer la migración generada en `back/src/base-datos/typeorm/migraciones/`.
4. Verificar que no contenga: DROP COLUMN, DROP TABLE, ALTER COLUMN (cambio de tipo) sin datos.
5. Si es destructiva: documentar el riesgo y requerir confirmación explícita.
6. Ejecutar `db:migration:show` para confirmar estado.

## Reglas

- NUNCA ejecutar `db:migration:run` sin aprobación explícita.
- NUNCA modificar una migración ya ejecutada.
- Toda columna nueva debe tener DEFAULT o `nullable: true`.

## Salida

Ruta de la migración generada + análisis de riesgo (destructiva: sí/no, razón).
