---
description: "Reglas para migraciones y entidades TypeORM"
globs: ["back/src/base-datos/typeorm/migraciones/**/*.ts", "back/src/**/dominio/entidades/**/*.ts"]
---

# Reglas TypeORM y Migraciones — EDURA

- Nunca modificar una migración ya ejecutada en cualquier entorno.
- Toda columna nueva debe tener valor DEFAULT o ser nullable para migraciones no destructivas.
- Toda entidad con datos de institución debe incluir `@Column() institucion_id: string`.
- Nombres de tablas en español: `@Entity('matriculas')`.
- Columnas de auditoría requeridas: `creado_en`, `actualizado_en` (usa `@CreateDateColumn`, `@UpdateDateColumn`).
- Generar migración después de cambiar una entidad:
  ```bash
  npm --prefix back run db:migration:generate --name=NombreDescriptivo
  ```
- Revisar la migración generada antes de confirmar; corregir si el ORM generó algo destructivo.
- Nunca ejecutar `db:migration:run` sin aprobación explícita del desarrollador.
- Nunca hacer DROP de columnas sin migración de respaldo de datos.
