# ADR-002 TypeORM Data Mapper

- Estado: aceptado.
- Contexto: se necesita PostgreSQL con control explícito de esquema.
- Decisión: usar TypeORM como Data Mapper, no Active Record.
- Alternativas: Prisma, Active Record.
- Consecuencias: separación entre persistencia y dominio.
- Riesgos: mayor verbosidad.
- Fecha: 2026-06-19.
