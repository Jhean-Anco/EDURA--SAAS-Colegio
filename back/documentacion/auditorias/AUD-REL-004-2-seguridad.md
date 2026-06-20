# AUD-REL-004.2 - Seguridad HTTP fail-closed y aislamiento multiinstitucion

**Fecha:** 2026-06-20  
**Rama:** `fix/rel-004-2-seguridad-fail-closed`  
**Base observada:** `550cd6f731181aee2a950d93fa9cd59bbf783cca`

## Hallazgos

### RSK-006 - Aislamiento institucional dependiente del controlador

**Evidencia**

- Varios controladores de instituciones y sedes no contrastaban el `:idInstitucion` o `:idSede` con el contexto autenticado.
- El consultador de permisos no incorporaba el alcance institucional/sede en la consulta SQL.

**Corrección**

- Se registran los guardias globalmente vía `APP_GUARD`.
- Se añade validación explícita del contexto institucional/sede en controladores críticos.
- Se corrige el consultador de permisos para filtrar por alcance `PLATAFORMA`, `INSTITUCION` y `SEDE`.

**Pruebas**

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run test`

**Resultado**

- Corregido a nivel de código.

### RSK-007 - Prueba falsa de aislamiento

**Evidencia**

- El E2E de personas tenía una sección sin aserciones y con retorno silencioso.

**Corrección**

- Se elimina el flujo de retorno silencioso.
- Se agregan pruebas de metadata para la política HTTP.
- Se agregan pruebas unitarias para el consultador de permisos.

**Pruebas**

- `npm.cmd run test`
- `npm.cmd run lint`

**Resultado**

- Parcialmente corregido en cobertura automatizada.
- El E2E de aislamiento completo necesita PostgreSQL activo para ejecutarse.

## Archivos tocados

- `src/app.module.ts`
- `src/compartido/infraestructura/persistencia/consultador-permisos.typeorm.ts`
- `src/compartido/presentacion/http/validacion-contexto-http.ts`
- `src/modulos/estructura-institucional/presentacion/http/controladores/*.ts`
- `src/modulos/infraestructura-fisica/presentacion/http/controladores/*.ts`
- `src/modulos/integraciones-externas/presentacion/http/integraciones.controlador.ts`
- `src/modulos/personas/presentacion/http/controladores/personas.controlador.ts`
- `test/arquitectura/seguridad-http.spec.ts`
- `test/unitarias/consultador-permisos.spec.ts`
- `test/unitarias/guardias-seguridad.spec.ts`
- `test/personas-flujo.e2e-spec.ts`

## Pendientes

- Ejecutar el E2E de aislamiento con PostgreSQL disponible.
- Extender el mismo patrón de validación de contexto a cualquier controlador nuevo que manipule `idInstitucion` o `idSede`.
