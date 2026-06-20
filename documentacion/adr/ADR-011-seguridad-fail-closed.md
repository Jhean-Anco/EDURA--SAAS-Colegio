# ADR-011 - Seguridad HTTP fail-closed y contexto institucional

**Estado:** Aceptado  
**Fecha:** 2026-06-20  
**Alcance:** REL-004.2

## Contexto

EDURA expone controladores de negocio para instituciones, sedes, infraestructura, personas e integraciones externas. La política requerida para la plataforma es que todo endpoint sea privado por defecto y que solo los endpoints marcados como públicos se puedan usar sin token.

Antes de esta corrección, la protección global estaba fragmentada y parte del aislamiento dependía de la disciplina de cada controlador. Eso no es aceptable para un entorno multiinstitución.

## Problema

Se necesitaba una política HTTP que cumpliera simultáneamente con:

- autenticación global fail-closed;
- autorización por permisos centralizada;
- contexto institucional derivado del token autenticado;
- rechazo de acceso cruzado entre instituciones y sedes;
- evidencia de prueba reproducible.

## Alternativas evaluadas

1. Guardias locales por controlador.
2. Middleware o interceptor global.
3. `APP_GUARD` global con metadata de `@Publico()` y `@Permisos()`.

## Decisión

Se adopta `APP_GUARD` global para `GuardiaJwt` y `GuardiaPermisos`.

- `GuardiaJwt` resuelve autenticación y carga `contextoActual`.
- `GuardiaPermisos` solo actúa cuando el método declara `@Permisos()`.
- `@Publico()` excluye autenticación solo en rutas explícitas.
- El contexto institucional y de sede se valida contra el token autenticado, no contra cuerpo, query ni headers no firmados.

## Consecuencias

### Positivas

- La seguridad queda fail-closed: un nuevo controlador nace privado.
- La política de permisos es uniforme y auditable.
- El contexto multiinstitución se resuelve desde la sesión autenticada.

### Costes

- Los controladores de dominio deben declarar permisos explícitos.
- Los endpoints de sedes e instituciones deben validar el ámbito del token.

## Excepciones públicas

- `GET /api/v1/salud`
- `POST /api/v1/autenticacion/iniciar-sesion`
- `POST /api/v1/autenticacion/renovar`

## Política de respuesta

- `401`: sin autenticación, token inválido, sesión inválida o usuario inactivo.
- `403`: autenticado sin permiso efectivo.
- `404`: recurso de otra institución o sede.
- `400`: entrada inválida.
- `409`: conflicto de integridad o estado.

## Pruebas

- Pruebas unitarias de `GuardiaPermisos`.
- Pruebas unitarias del consultador de permisos.
- Prueba de arquitectura que inspecciona metadata de Nest.
- Pruebas de integración/E2E de autenticación y aislamiento.

## Riesgo residual

El E2E de aislamiento multiinstitución requiere una base PostgreSQL disponible para ejecutarse en este entorno. La política de código está aplicada; la validación E2E debe ejecutarse con la BD activa en CI o en una máquina con PostgreSQL.
