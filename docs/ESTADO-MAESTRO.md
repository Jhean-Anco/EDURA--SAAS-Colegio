# Estado Maestro del Repositorio

Este archivo resume el estado actual del backend EDURA para lectura rápida.

## Visión

EDURA evoluciona como SaaS escolar multiinstitución, con la institución educativa como tenant principal y la sede como subcontexto operativo cuando aplica.

## Alcance actual

- Estructura institucional.
- Infraestructura física.
- Identidad y acceso.
- Personas.
- Panel institucional.
- Estudiantes y apoderados.
- Integraciones externas.

## Módulos implementados

- `estructura-institucional`
- `infraestructura-fisica`
- `identidad-acceso`
- `personas`
- `panel-institucional`
- `estudiantes`
- `integraciones-externas`

## Módulos pendientes

- Docentes.
- Matrícula.
- Asistencia.
- Calificaciones.
- Pagos.
- Mensajería completa.
- Analítica académica avanzada.

## Actores principales

- Propietario de plataforma.
- Administrador de institución.
- Director de sede.
- Coordinador de sede.
- Personal operativo.

## Decisiones arquitectónicas

- Monolito modular NestJS.
- TypeORM con Data Mapper.
- PostgreSQL como única base transaccional.
- Seguridad fail-closed.
- Multiinstitución por `id_institucion_educativa`.
- Sede como subámbito cuando corresponde.
- Dominio en español.

## Riesgos

- Crecimiento funcional sin consolidar aún matrícula y asistencia.
- Evolución de permisos y contexto institucional con más actores.
- Dependencia de E2E contra PostgreSQL real para validar flujo completo.

## Deuda técnica

- Expandir documentación por módulo cuando cambien contratos.
- Completar cobertura e2e multiinstitución para todos los módulos críticos.
- Mantener sincronía entre migraciones, entidades TypeORM y semillas.

## Próximos hitos

1. Docentes.
2. Matrícula.
3. Asistencia.
4. Calificaciones.
5. Pagos.
6. Reportes académicos.
