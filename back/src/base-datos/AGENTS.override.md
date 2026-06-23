# AGENTS.override.md — base-datos

Restricciones adicionales para archivos de base de datos y migraciones.

## Reglas estrictas

- NUNCA ejecutar `db:migration:run` sin aprobación explícita del desarrollador.
- NUNCA modificar una migración ya ejecutada (identificarla por fecha en el nombre).
- NUNCA hacer DROP COLUMN o DROP TABLE sin plan de rollback documentado.
- Toda columna nueva debe tener `DEFAULT` o `nullable: true`.
- Columnas de auditoría obligatorias: `@CreateDateColumn`, `@UpdateDateColumn`.

## Generar migración después de cambiar entidad

```bash
npm --prefix back run db:migration:generate --name=NombreDescriptivo
```

Revisar la migración generada ANTES de confirmar.

## Sembrar datos

Solo en entornos no productivos. Verificar `ENTORNO` antes de ejecutar.
