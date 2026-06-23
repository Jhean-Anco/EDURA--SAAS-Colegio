---
id: validar-esquema-base-datos
version: "1.0.0"
descripcion: "Verifica que las entidades TypeORM y las migraciones estén en sincronía"
categoria: base-datos
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nueva entidad agregada
  - nueva migración creada
  - cambio de columna o tipo
no_activar_cuando:
  - cambios solo en lógica de dominio sin tocar entidades
herramientas_permitidas: [lectura, busqueda_dirigida, ejecucion_migration_show]
presupuesto: normal
---

## Pasos

1. Listar entidades modificadas:
   ```
   pnpm ai:search -- "@Entity" --glob "back/src/**/dominio/entidades/**/*.ts"
   ```
2. Para cada entidad modificada: verificar que exista una migración correspondiente.
3. Ejecutar `npm --prefix back run db:migration:show` para ver estado de migraciones.
4. Verificar que la migración incluya todos los cambios de la entidad.
5. Verificar restricciones de multitenencia: columna `institucion_id` presente si corresponde.
6. Verificar columnas de auditoría: `creado_en`, `actualizado_en`.
7. Verificar que no haya cambios destructivos sin plan de rollback.

## Salida

Estado por entidad: sincronizada / sin migración / migración pendiente de revisión.
Lista de problemas bloqueantes si los hay.
