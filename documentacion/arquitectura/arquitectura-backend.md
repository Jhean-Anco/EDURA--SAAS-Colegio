# Arquitectura backend

- Monolito modular con módulos de frontera clara.
- Capas: `presentacion -> aplicacion -> dominio -> infraestructura`.
- Infraestructura implementa puertos y acceso a datos.
- Módulos principales:
  - `EstructuraInstitucionalModule`
  - `InfraestructuraFisicaModule`
- Persistencia con TypeORM Data Mapper y PostgreSQL.
- Migraciones versionadas, `synchronize: false`, `migrationsRun: false`.
- No implementado en esta fase: auth, usuarios, roles, matrícula, estudiantes, docentes, pagos, inventario móvil, mantenimiento, archivos y microservicios.
