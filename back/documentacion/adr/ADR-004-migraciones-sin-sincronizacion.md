# ADR-004 Migraciones sin sincronización

- Estado: aceptado.
- Contexto: el esquema debe ser versionado y reproducible.
- Decisión: `synchronize=false` y `migrationsRun=false`.
- Alternativas: sincronización automática.
- Consecuencias: más disciplina operativa.
- Riesgos: fallas si la migración no se mantiene al día.
- Fecha: 2026-06-19.
