# ADR-009 — Corrección controlada de migraciones V09 y V10

**Estado:** Aceptado  
**Fecha:** 2026-06-20  
**Autores:** Equipo EDURA

## Contexto

Las migraciones V09 y V10 contenían dos defectos que impedían una instalación limpia:

1. **V09 referenciaba `personas` antes de su creación**: La migración agregaba una FK desde `membresias_institucion.id_persona` hacia `personas(id)`, pero la tabla `personas` no existía hasta V10.

2. **SQL inválido en PostgreSQL 16**: La cláusula `ADD CONSTRAINT IF NOT EXISTS` no existe en PostgreSQL. Solo `ADD COLUMN IF NOT EXISTS` es válida. Esto causaba error de sintaxis al ejecutar V09.

## Decisión

Dado que estas migraciones nunca habían sido aplicadas en ambientes de producción (el proyecto se encontraba en desarrollo activo), se optó por la corrección directa siguiendo el **Caso A** del plan de release:

- **V09 corregida**: Se eliminaron las sentencias inválidas. V09 ahora solo crea índices de rendimiento sobre `(id_institucion_educativa, estado)` y `(id_usuario, estado)` en `membresias_institucion`.
- **V10 corregida**: Se movió la columna `id_persona` y su FK a `membresias_institucion` para ejecutarse **después** de la creación de `personas`. Se agregaron además las FKs faltantes en `documentos_identidad_persona`, `medios_contacto_persona` y `direcciones_persona`.
- **V11 creada**: Agrega todas las restricciones de integridad compuestas (UNIQUE, CHECK, índices parciales) que no era posible agregar en V10 sin romper el orden de dependencias.

## Consecuencias

- Una base de datos vacía ejecuta V01→V11 sin errores.
- Las restricciones de integridad multiinstitución quedan garantizadas a nivel de base de datos.
- Las migraciones son idempotentes (usan `IF NOT EXISTS` donde corresponde).
- Si en el futuro se detecta que V09/V10 ya estaban aplicadas en algún ambiente, se deberá crear una migración adicional de reconciliación que detecte el estado y agregue solo lo faltante.
